import { Redirect } from 'expo-router';

//Index que nos redirige a tabs, debido a que estamos usando Stacks
export default function Index() {
  return <Redirect href="/(tabs)" />;
}