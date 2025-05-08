import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { icons } from "@/constants";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UserCard from "@/components/UserCard";

type Cita = {
  idCita: number;
  fechaHora: string;
  paciente: {
    nombre: string;
    sexo: string;
    id: number;
  };
  medico: {
    nombre: string;
    id: number;
  };
  estado: string;
  motivo?: string;
};

type Medicamento = {
  id: number;
  nombre: string;
  presentacion: string;
  tipo: string;
};

type Usuario = {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono?: string;
  sexo: string;
  rol: string;
  password?: string;
  altura?: number;
  peso?: number;
  edad?: number;
  direccion?: string;
  enabled?: boolean;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  authorities?: Array<{ authority: string }>;
  username?: string;
  credentialsNonExpired?: boolean;
  // Añade especialidad solo si aplica para médicos
  especialidad?: string;
  activo: boolean;
};

const AdminDashboard = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "citas" | "pacientes" | "medicos" | "medicamentos"
  >("citas");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [nuevoMedicamento, setNuevoMedicamento] = useState({
    nombre: "",
    presentacion: "",
    tipo: "",
  });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Usuario[]>([]);
  const [medicos, setMedicos] = useState<Usuario[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Obtener todas las citas
  const fetchCitas = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8080/api/admin/citas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        setCitas(response.data.data);
      }
    } catch (error) {
      console.error("Error al obtener citas:", error);
      Alert.alert("Error", "No se pudieron cargar las citas");
    }
  };

  // Obtener todos los pacientes
  const fetchPacientes = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8080/api/admin/pacientes",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        setPacientes(response.data); // Cambia de response.data.data a response.data
      }
    } catch (error) {
      console.error("Error al obtener pacientes:", error);
      Alert.alert("Error", "No se pudieron cargar los pacientes");
    }
  };

  // Obtener todos los médicos
  const fetchMedicos = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8080/api/admin/medicos",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        setMedicos(response.data);
      }
    } catch (error) {
      console.error("Error al obtener médicos:", error);
      Alert.alert("Error", "No se pudieron cargar los médicos");
    }
  };

  // Cancelar cita
  const cancelarCita = async (citaId: number) => {
    Alert.alert(
      "Confirmar cancelación",
      "¿Estás seguro que deseas cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              setIsLoading(true);
              const token = await AsyncStorage.getItem("authToken");
              const response = await axios.put(
                `http://localhost:8080/api/admin/citas/${citaId}/cancelar`,
                null,
                {
                  params: { nuevoEstado: "CANCELADA" },
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (response.data.error) {
                Alert.alert("Error", response.data.message);
              } else {
                Alert.alert("Éxito", "Cita cancelada correctamente");
                fetchCitas();
              }
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la cita");
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  //desactivar
  const eliminarUsuario = async (
    usuarioId: number,
    tipo: "paciente" | "medico"
  ) => {
    Alert.alert(
      "Confirmar desactivación",
      `¿Estás seguro que deseas desactivar a este ${tipo}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              setIsLoading(true);
              const token = await AsyncStorage.getItem("authToken");
              
              // Corrección importante: Configuración correcta de axios.patch
              const response = await axios.patch(
                `http://localhost:8080/api/admin/${usuarioId}/desactivar`,
                null, // Body vacío ya que solo cambias el estado
                {
                  headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
  
              if (response.data.error) {
                Alert.alert("Error", response.data.message);
              } else {
                Alert.alert(
                  "Éxito",
                  `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} desactivado correctamente`
                );
                // Actualiza la lista correspondiente
                if (tipo === "paciente") {
                  fetchPacientes();
                } else {
                  fetchMedicos();
                }
              }
            } catch (error) {
              console.error(`Error al desactivar ${tipo}:`, error);
              
              // Manejo de errores más detallado
              let errorMessage = `No se pudo desactivar el ${tipo}`;
              if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
              }
              
              Alert.alert("Error", errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const fetchMedicamentos = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8080/api/medicamentos",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        setMedicamentos(response.data.data);
      }
    } catch (error) {
      console.error("Error al obtener medicamentos:", error);
      Alert.alert("Error", "No se pudieron cargar los medicamentos");
    }
  };

  const eliminarMedicamento = async (id: number) => {
    Alert.alert(
      "Confirmar eliminación",
      "¿Estás seguro que deseas eliminar este medicamento?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              setIsLoading(true);
              const token = await AsyncStorage.getItem("authToken");
              const response = await axios.delete(
                `http://localhost:8080/api/medicamentos/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (response.data.error) {
                Alert.alert("Error", response.data.message);
              } else {
                Alert.alert("Éxito", "Medicamento eliminado correctamente");
                fetchMedicamentos();
              }
            } catch (error) {
              console.error("Error al eliminar medicamento:", error);
              Alert.alert("Error", "No se pudo eliminar el medicamento");
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const agregarMedicamento = async () => {
    if (
      !nuevoMedicamento.nombre ||
      !nuevoMedicamento.presentacion ||
      !nuevoMedicamento.tipo
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      console.log(nuevoMedicamento);
      const response = await axios.post(
        "http://localhost:8080/api/medicamentos",
        nuevoMedicamento,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        Alert.alert("Éxito", "Medicamento agregado correctamente");
        setNuevoMedicamento({ nombre: "", presentacion: "", tipo: "" });
        fetchMedicamentos();
      }
    } catch (error) {
      console.error("Error al agregar medicamento:", error);
      Alert.alert("Error", "No se pudo agregar el medicamento");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar datos basados en la búsqueda
  const filteredCitas = Array.isArray(citas)
    ? citas.filter(
        (cita) =>
          cita.paciente.nombre
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cita.medico.nombre
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cita.motivo?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredPacientes = Array.isArray(pacientes)
    ? pacientes.filter(
        (paciente) =>
          paciente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          paciente.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (paciente.telefono && paciente.telefono.includes(searchQuery))
      )
    : [];

  const filteredMedicos = Array.isArray(medicos)
    ? medicos.filter(
        (medico) =>
          medico.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medico.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (medico.especialidad &&
            medico.especialidad
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (medico.telefono && medico.telefono.includes(searchQuery))
      )
    : [];

  const filteredMedicamentos = Array.isArray(medicamentos)
    ? medicamentos.filter(
        (medicamento) =>
          medicamento.nombre
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          medicamento.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          medicamento.presentacion
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  // Formatear fecha
  const formatearFecha = (fechaHora: string) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (activeSection === "citas") {
      fetchCitas();
    } else if (activeSection === "pacientes") {
      fetchPacientes();
    } else if (activeSection === "medicos") {
      fetchMedicos();
    } else if (activeSection === "medicamentos") {
      fetchMedicamentos();
    }
  }, [activeSection]);

  return (
    <SafeAreaView className="bg-primary flex-1">
      <StatusBar backgroundColor="#161622" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-2 bg-secondary">
        <Text className="text-xl text-white font-bold">
          Panel de Administrador
        </Text>
        <Image source={icons.profile} className="w-8 h-8" />
      </View>

      {/* Menú de navegación */}
      <View className="border-b border-gray-700">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="py-2"
        >
          {["citas", "pacientes", "medicos", "medicamentos"].map((section) => (
            <TouchableOpacity
              key={section}
              className={`px-4 py-2 mx-1 ${
                activeSection === section ? "border-b-2 border-terciary" : ""
              }`}
              onPress={() => setActiveSection(section as any)}
            >
              <Text
                className={`text-base ${
                  activeSection === section
                    ? "text-terciary font-semibold"
                    : "text-gray-400"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Barra de búsqueda */}
      <View className="px-4 pt-4">
        <View className="bg-white rounded-full border border-gray-300">
          <View className="flex-row items-center px-4 py-2">
            <Image
              source={icons.search}
              className="w-4 h-4 mr-2"
              style={{ tintColor: "#6B7280" }}
            />
            <TextInput
              placeholder={`Buscar ${activeSection}...`}
              placeholderTextColor="#9CA3AF"
              className="text-gray-800 flex-1"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Image
                  source={icons.close}
                  className="w-4 h-4"
                  style={{ tintColor: "#6B7280" }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView className="flex-1 px-4 pt-4 pb-20">
        {activeSection === "citas" && (
          <View>
            {filteredCitas.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">
                {searchQuery
                  ? "No se encontraron citas"
                  : "No hay citas registradas"}
              </Text>
            ) : (
              filteredCitas.map((cita) => (
                <View
                  key={cita.idCita}
                  className="bg-black-200 p-4 rounded-lg mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        Paciente: {cita.paciente.nombre}
                      </Text>
                      <Text className="text-white mt-1">
                        Médico: {cita.medico.nombre}
                      </Text>
                      <Text className="text-gray-400 mt-1">
                        {formatearFecha(cita.fechaHora)}
                      </Text>
                      <Text className="text-gray-400">
                        Motivo: {cita.motivo || "No especificado"}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${
                          cita.estado === "CONFIRMADA"
                            ? "text-terciary"
                            : cita.estado === "COMPLETADA"
                            ? "text-secondary"
                            : cita.estado === "CANCELADA"
                            ? "text-error"
                            : "text-yellow-500"
                        }`}
                      >
                        Estado: {cita.estado}
                      </Text>
                    </View>
                    {cita.estado !== "CANCELADA" &&
                      cita.estado !== "COMPLETADA" && (
                        <TouchableOpacity
                          className="bg-error px-3 py-1 rounded-lg ml-2"
                          onPress={() => cancelarCita(cita.idCita)}
                          disabled={isLoading}
                        >
                          <Text className="text-white font-semibold">
                            Cancelar
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeSection === "pacientes" && (
          <View>
            {filteredPacientes.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">
                {searchQuery
                  ? "No se encontraron pacientes"
                  : "No hay pacientes registrados"}
              </Text>
            ) : (
              filteredPacientes.map((paciente) => (
                <UserCard
                  key={`paciente-${paciente.idUsuario}`}
                  user={{
                    id: paciente.idUsuario,
                    nombre: paciente.nombre,
                    correo: paciente.correo,
                    telefono: paciente.telefono || "No especificado",
                    rol: "Paciente",
                    activo: paciente.activo,
                  }}
                  onDelete={() =>
                    eliminarUsuario(paciente.idUsuario, "paciente")
                  }
                  loading={isLoading}
                />
              ))
            )}
          </View>
        )}

        {activeSection === "medicos" && (
          <View>
            {filteredMedicos.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">
                {searchQuery
                  ? "No se encontraron médicos"
                  : "No hay médicos registrados"}
              </Text>
            ) : (
              filteredMedicos.map((medico) => (
                <UserCard
                  key={`medico-${medico.idUsuario}`}
                  user={{
                    id: medico.idUsuario,
                    nombre: medico.nombre,
                    correo: medico.correo,
                    telefono: medico.telefono || "No especificado",
                    rol: medico.especialidad
                      ? `Médico (${medico.especialidad})`
                      : "Médico",
                    activo: medico.activo
                  }}
                    
                  onDelete={() => eliminarUsuario(medico.idUsuario, "medico")}
                  loading={isLoading}
                />
              ))
            )}
          </View>
        )}

        {activeSection === "medicamentos" && (
          <View>
            {/* Formulario para agregar nuevo medicamento */}
            <View className="bg-black-200 p-4 rounded-lg mb-4">
              <Text className="text-white font-semibold mb-2">
                Agregar Nuevo Medicamento
              </Text>
              <TextInput
                placeholder="Nombre"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-lg px-4 py-2 mb-2"
                value={nuevoMedicamento.nombre}
                onChangeText={(text) =>
                  setNuevoMedicamento({ ...nuevoMedicamento, nombre: text })
                }
              />
              <TextInput
                placeholder="Presentación"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-lg px-4 py-2 mb-2"
                value={nuevoMedicamento.presentacion}
                onChangeText={(text) =>
                  setNuevoMedicamento({
                    ...nuevoMedicamento,
                    presentacion: text,
                  })
                }
              />
              <TextInput
                placeholder="Tipo"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-lg px-4 py-2 mb-2"
                value={nuevoMedicamento.tipo}
                onChangeText={(text) =>
                  setNuevoMedicamento({ ...nuevoMedicamento, tipo: text })
                }
              />
              <TouchableOpacity
                className="bg-terciary px-4 py-2 rounded-lg"
                onPress={agregarMedicamento}
                disabled={isLoading}
              >
                <Text className="text-white font-semibold text-center">
                  Agregar Medicamento
                </Text>
              </TouchableOpacity>
            </View>

            {/* Lista de medicamentos */}
            {filteredMedicamentos.length === 0 ? (
              <Text className="text-gray-400 text-center my-4">
                {searchQuery
                  ? "No se encontraron medicamentos"
                  : "No hay medicamentos registrados"}
              </Text>
            ) : (
              filteredMedicamentos.map((medicamento) => (
                <View
                  key={`medicamento-${medicamento.id}`}
                  className="bg-black-200 p-4 rounded-lg mb-3"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        {medicamento.nombre}
                      </Text>
                      <Text className="text-gray-400 mt-1">
                        Presentación: {medicamento.presentacion}
                      </Text>
                      <Text className="text-gray-400">
                        Tipo: {medicamento.tipo}
                      </Text>
                    </View>
                    <TouchableOpacity
                      className="bg-error px-3 py-1 rounded-lg ml-2"
                      onPress={() => eliminarMedicamento(medicamento.id)}
                      disabled={isLoading}
                    >
                      <Text className="text-white font-semibold">Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
