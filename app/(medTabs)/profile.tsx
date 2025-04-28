import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "../../constants";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomButton from "@/components/CustomButton";
import AppointmentCardDoc from "@/components/AppointmentCardDoc";

type TabType = "info" | "citas";
type AppointmentStatus =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "COMPLETADA"
  | "CANCELADA";

interface User {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono?: string;
  especialidad: string;
  sexo: string;
}

interface Appointment {
  id: string;
  fechaHora: string;
  paciente: {
    nombre: string;
    sexo: string;
    id: number;
  };
  estado: AppointmentStatus;
  motivo: string;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    especialidad: "",
    telefono: "",
  });

  const updateData = async () => {
    if (!user) {
      Alert.alert("Error", "Intentalo más tarde");
      return;
    }

    if (!isEditing) {
      // Entrar en modo edición
      setIsEditing(true);
      setEditedData({
        especialidad: user.especialidad || "",
        telefono: user.telefono || "",
      });
      return;
    }

    // Enviar datos actualizados
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:8080/api/medicos/actualizar-datos",
        { especialidad: user.especialidad, telefono: user.telefono },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.error) {
        throw new Error(response.data.message);
      }

      // Actualizar el estado del usuario con los nuevos datos
      setUser((prev) =>
        prev
          ? {
              ...prev,
              especialidad: editedData.especialidad,
              telefono: editedData.telefono
            }
          : null
      );

      Alert.alert("Éxito", "Datos actualizados correctamente");
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      Alert.alert("Error", "No se pudieron actualizar los datos");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "No se encontró el token de autenticación");
        return;
      }

      const response = await axios.get(
        "http://localhost:8080/api/medicos/profile",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error) {
        Alert.alert("Error", response.data.message);
        return;
      }

      setUser(response.data.data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo obtener la información del médico");
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        "http://localhost:8080/api/medicos/citas",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const mappedAppointments = response.data.data.map((cita: any) => ({
        id: cita.id.toString(),
        fechaHora: cita.fechaHora,
        paciente: {
          nombre: cita.paciente.nombre,
          sexo: cita.paciente.sexo,
          id: cita.paciente.id,
        },
        estado: cita.estado as AppointmentStatus,
        motivo: cita.motivo,
      }));

      setAppointments(mappedAppointments);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudieron cargar las citas"
      );
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    router.push(`/receta-medica?citaId=${appointmentId}`);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    // Mostrar diálogo de confirmación
    Alert.alert(
      "Confirmar cancelación",
      "¿Estás seguro que deseas cancelar esta cita?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí",
          onPress: async () => {
            await executeCancelAppointment(appointmentId);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };
  
  const executeCancelAppointment = async (appointmentId: string) => {
    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.put(
        `http://localhost:8080/api/medicos/citas/${appointmentId}/estado`,
        null,
        {
          params: { nuevoEstado: "CANCELADA" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (response.data.error) {
        Alert.alert("Error", response.data.message);
      } else {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, estado: "CANCELADA" } : app
          )
        );
        Alert.alert("Éxito", "Cita cancelada correctamente");
      }
    } catch (error: any) {
      console.error("Error al cancelar cita:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Error al cancelar la cita"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchAppointments();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <View className="h-full w-full px-6 mt-6">
            {user ? (
              <View className="space-y-4">
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image
                      source={icons.mail}
                      className="w-5 h-5 mr-2"
                      resizeMode="contain"
                    />
                    <Text className="text-base font-medium text-gray-100">
                      Correo:
                    </Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.correo}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image
                      source={
                        user.sexo === "Masculino" ? icons.male : icons.female
                      }
                      className="w-5 h-5 mr-2"
                      resizeMode="contain"
                    />
                    <Text className="text-base font-medium text-gray-100">
                      Sexo:
                    </Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.sexo}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image
                      source={icons.date}
                      className="w-5 h-5 mr-2"
                      resizeMode="contain"
                    />
                    <Text className="text-base font-medium text-gray-100">
                      Especialidad:
                    </Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded w-20 text-right"
                      value={editedData.especialidad}
                      onChangeText={(text) =>
                        setEditedData({ ...editedData, especialidad: text })
                      }
                      placeholder="Ej. General"
                    />
                  ) : (
                    <Text className="text-base font-normal text-gray-300">
                      {user.especialidad
                        ? `${user.especialidad}`
                        : "No especificado"}
                    </Text>
                  )}
                </View>

                {user.telefono && (
                  <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                    <View className="flex-row items-center">
                      <Image
                        source={icons.phone}
                        className="w-5 h-5 mr-2"
                        resizeMode="contain"
                      />
                      <Text className="text-base font-medium text-gray-100">
                        Teléfono:
                      </Text>
                    </View>
                    {isEditing ? (
                      <TextInput
                        className="text-base font-normal text-gray-300 bg-black-300 px-2 py-1 rounded w-20 text-right"
                        value={editedData.telefono}
                        onChangeText={(text) =>
                          setEditedData({ ...editedData, telefono: text })
                        }
                        placeholder="Ej. 734xxxxxxx"
                      />
                    ) : (
                      <Text className="text-base font-normal text-gray-300">
                        {user.telefono
                          ? `${user.telefono}`
                          : "No especificado"}
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-lg text-gray-400 text-center mt-8">
                Cargando información...
              </Text>
            )}

            {/* Botón de acción */}
            <View className="flex-row justify-center space-x-4 mt-6">
              {isEditing ? (
                <>
                  <CustomButton
                    title="Cancelar"
                    handlePress={() => setIsEditing(false)}
                    containerStyles="w-1/3 bg-gray-500"
                    textStyles="text-white"
                  />
                  <CustomButton
                    title="Guardar"
                    handlePress={updateData}
                    containerStyles="w-1/3 ml-5"
                    textStyles="text-white"
                    isLoading={isSubmitting}
                  />
                </>
              ) : (
                <CustomButton
                  title="Editar datos"
                  handlePress={() => {
                    setIsEditing(true);
                    setEditedData({
                      especialidad: user?.especialidad || "",
                      telefono: user?.telefono || "",
                    });
                  }}
                  containerStyles="w-2/4 mx-auto"
                  textStyles="text-white"
                />
              )}
            </View>
          </View>
        );

      case "citas":
        return (
          <View className="w-full mt-4">
            {appointments.length === 0 ? (
              <Text className="text-gray-400 text-center mt-8">
                No tienes citas programadas
              </Text>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCardDoc
                  key={appointment.id}
                  appointment={{
                    id: appointment.id,
                    fechaHora: appointment.fechaHora,
                    paciente: {
                      nombre: appointment.paciente.nombre,
                      sexo: appointment.paciente.sexo,
                    },
                    estado: appointment.estado,
                    motivo: appointment.motivo,
                  }}
                  onConfirm={() => handleConfirmAppointment(appointment.id)}
                  onCancel={() => handleCancelAppointment(appointment.id)}
                />
              ))
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="items-center mt-6">
          <Image
            source={icons.profile}
            className="w-[100px] h-[100px]"
            resizeMode="contain"
          />
          <Text className="text-2xl text-white font-semibold mt-4">
            {user?.sexo === "Masculino" ? "Dr." : "Dra."}{" "}
            {user?.nombre || "Usuario"}
          </Text>
          {user?.especialidad && (
            <Text className="text-terciary text-lg mt-1">
              {user.especialidad}
            </Text>
          )}
        </View>

        <View className="flex-row justify-center mt-6 border-b border-gray-700 mx-4">
          <TouchableOpacity
            className={`px-6 pb-3 ${
              activeTab === "info" ? "border-b-2 border-terciary" : ""
            }`}
            onPress={() => setActiveTab("info")}
          >
            <Text
              className={`text-lg ${
                activeTab === "info"
                  ? "text-terciary font-semibold"
                  : "text-gray-400"
              }`}
            >
              Info.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`px-6 pb-3 ${
              activeTab === "citas" ? "border-b-2 border-terciary" : ""
            }`}
            onPress={() => setActiveTab("citas")}
          >
            <Text
              className={`text-lg ${
                activeTab === "citas"
                  ? "text-terciary font-semibold"
                  : "text-gray-400"
              }`}
            >
              Citas
            </Text>
          </TouchableOpacity>
        </View>

        {renderContent()}
      </ScrollView>
      <StatusBar backgroundColor={"#161622"} />
    </SafeAreaView>
  );
};

export default Profile;
