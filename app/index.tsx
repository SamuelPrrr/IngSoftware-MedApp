import React from 'react'
import { StatusBar } from 'react-native';
import {Text, View } from 'react-native'
import { Link, Redirect } from 'expo-router';

//Index que nos redirige a tabs, debido a que estamos usando Stacks
export default function Index() {
  return(
  <View className="flex-1 items-center justify-center bg-white">
      <Link href="/profile">Go</Link>
  </View>
  );
} 