import { View, Text, TouchableOpacity, Image } from "react-native";
import { icons } from "@/constants";

interface UserCardProps {
  user: {
    id: number;
    nombre: string;
    correo: string;
    telefono: string;
    rol: string;
  };
  onDelete: () => void;
  loading: boolean;
}

const UserCard = ({ user, onDelete, loading }: UserCardProps) => {
  return (
    <View className="bg-black-200 p-4 rounded-lg mb-3">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-white font-semibold">{user.nombre}</Text>
          <Text className="text-gray-400 mt-1">{user.correo}</Text>
          <Text className="text-gray-400 mt-1">Tel: {user.telefono}</Text>
          <Text className="text-terciary mt-1">{user.rol}</Text>
        </View>
        <TouchableOpacity
          className="bg-error p-2 rounded-lg"
          onPress={onDelete}
          disabled={loading}
        >
          <Image
            source={icons.close}
            className="w-5 h-5"
            style={{ tintColor: "white" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserCard;