import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

interface UserCardProps {
  user: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    rol: string;
    activo: boolean;
  };
  onDelete: () => void;
  loading: boolean;
}

const UserCard = ({ user, onDelete, loading }: UserCardProps) => {
  return (
    <View className="bg-black-200 p-4 rounded-lg mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-semibold text-lg">{user.nombre}</Text>
          <Text className="text-gray-400 mt-1">{user.correo}</Text>
          <Text className="text-gray-400 mt-1">Tel: {user.telefono}</Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-terciary">{user.rol}</Text>
          </View>
        </View>

        <TouchableOpacity
          className={`flex-row items-center justify-center px-4 py-2 rounded-lg ml-2 min-w-[100px] ${
            user.activo 
              ? "bg-red-600 active:bg-red-700" 
              : "bg-gray-600"
          }`}
          onPress={onDelete}
          disabled={loading || !user.activo}
        >
          {user.activo && (
            <Image
              source={icons.close}
              className="w-4 h-4 mr-2"
              style={{ tintColor: "white" }}
            />
          )}
          <Text className="text-white font-semibold text-sm">
            {user.activo ? "Desactivar" : "Inactivo"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserCard;