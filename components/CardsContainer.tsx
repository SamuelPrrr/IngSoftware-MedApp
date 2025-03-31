import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React from 'react';

type CardsContainerProps = {
  title: string;
  handlePress: () => void;
  containerStyles?: any; // Acepta estilos personalizados
  isLoading?: boolean;
};

const CardsContainer: React.FC<CardsContainerProps> = ({ title, handlePress, containerStyles, isLoading }) => {
  return (
    <TouchableOpacity style={[styles.card, containerStyles]} onPress={handlePress} disabled={isLoading}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.footer}>
        {isLoading ? <ActivityIndicator size="small" color="#2C5696" /> : null}
      </View>
    </TouchableOpacity>
  );
};

export default CardsContainer;

const styles = StyleSheet.create({
  card: {
    width: 250,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2C5696',
    padding: 15,
    justifyContent: 'space-between',
  },
  title: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 20,
    backgroundColor: '#62A8E5',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
