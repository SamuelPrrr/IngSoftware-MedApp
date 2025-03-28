import AsyncStorage from '@react-native-async-storage/async-storage';

// Almacenar el token en AsyncStorage
export const storeAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error('Error al almacenar el token:', error);
  }
};

// Obtener el token desde AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

// Eliminar el token cuando el usuario cierre sesión
const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};
