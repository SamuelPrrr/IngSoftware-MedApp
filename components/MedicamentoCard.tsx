import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { icons } from '@/constants';

// Definimos el tipo para las propiedades del medicamento
type MedicamentoRecetado = {
  idMedicamentoRecetado: number;
  cantidadDosis: string;
  frecuencia: string;
  numeroDias: number;
  dosisActual?: number;
  numDosis?: number;
  medicamento: {
    idMedicamento: number;
    nombre: string;
    presentacion?: string;
    tipo?: string;
  };
};

// Definimos las props del componente
type MedicamentoCardProps = {
  medicamento: MedicamentoRecetado;
  onDelete: () => void;
  onEdit?: () => void; // Opcional para futura funcionalidad
};

const MedicamentoCard: React.FC<MedicamentoCardProps> = ({ medicamento, onDelete, onEdit }) => {
  return (
    <View className="bg-gray-800 p-4 rounded-lg mb-2 flex-row justify-between items-center">
      <View className="flex-1">
        {/* Nombre y presentación del medicamento */}
        <Text className="text-white font-medium">
          {medicamento.medicamento.nombre}
          {medicamento.medicamento.presentacion && (
            <Text className="text-gray-400"> ({medicamento.medicamento.presentacion})</Text>
          )}
        </Text>
        
        {/* Detalles de la dosificación */}
        <Text className="text-gray-400 text-sm mt-1">
          {medicamento.cantidadDosis} cada {medicamento.frecuencia} 
        </Text>
        <Text className="text-gray-400 text-sm">
          Duración: {medicamento.numeroDias} días | Total dosis: {medicamento.numDosis || 'N/A'}
        </Text>
        
        {/* Mostrar progreso si existe */}
        {medicamento.dosisActual !== undefined && (
          <Text className="text-terciary text-xs mt-1">
            Tomadas: {medicamento.dosisActual}/{medicamento.numDosis}
          </Text>
        )}
      </View>
      
      {/* Botones de acción */}
      <View className="flex-row space-x-2">
        {onEdit && (
          <TouchableOpacity 
            onPress={onEdit}
            className="bg-blue-500 px-2 py-1 rounded"
          >
            <Text className="text-white text-xs">Editar</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={onDelete}
          className="bg-error px-2 py-1 rounded"
        >
          <Text className="text-white text-xs">Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MedicamentoCard;