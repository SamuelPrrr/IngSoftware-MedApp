import {
    View,
    Text,
    Image,
    ScrollView,
    StatusBar,
    Alert,
    TouchableOpacity,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { icons } from "../../constants";
  import { useRouter } from "expo-router";
  import axios from "axios";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  interface AdminUser {
    idUsuario: number;
    nombre: string;
    correo: string;
    telefono?: string;
    sexo: string;
    rol: string;
  }
  
  const AdminProfile = () => {
    const [user, setUser] = useState<AdminUser | null>(null);
    const router = useRouter();
  
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          Alert.alert("Error", "No se encontró el token de autenticación");
          return;
        }
  
        const response = await axios.get(
          "http://localhost:8080/api/admin/profile",
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
        Alert.alert("Error", "No se pudo obtener la información del administrador");
      }
    };
  
    useEffect(() => {
      fetchUserData();
    }, []);
  
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
              {user?.nombre || "Administrador"}
            </Text>
            <Text className="text-terciary text-lg mt-1">Administrador</Text>
          </View>
  
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
                      source={user.sexo === "Masculino" ? icons.male : icons.female}
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
                    <Text className="text-base font-normal text-gray-300">
                      {user.telefono}
                    </Text>
                  </View>
                )}
  
                <View className="flex-row justify-between items-center bg-black-200 p-4 rounded-lg">
                  <View className="flex-row items-center">
                    <Image
                      source={icons.bookmark}
                      className="w-5 h-5 mr-2"
                      resizeMode="contain"
                    />
                    <Text className="text-base font-medium text-gray-100">
                      Rol:
                    </Text>
                  </View>
                  <Text className="text-base font-normal text-gray-300">
                    {user.rol}
                  </Text>
                </View>
              </View>
            ) : (
              <Text className="text-lg text-gray-400 text-center mt-8">
                Cargando información...
              </Text>
            )}
          </View>
        </ScrollView>
        <StatusBar backgroundColor={"#161622"} />
      </SafeAreaView>
    );
  };
  
  export default AdminProfile;