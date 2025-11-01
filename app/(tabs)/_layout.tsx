
import React from 'react';
import { Platform } from 'react-native';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { Stack } from 'expo-router';

const tabs: TabBarItem[] = [
  {
    route: '/(tabs)/(home)',
    label: 'Home',
    icon: 'house.fill',
  },
  {
    route: '/(tabs)/settings',
    label: 'Settings',
    icon: 'gearshape.fill',
  },
];

export default function TabLayout() {
  if (Platform.OS === 'web') {
    return (
      <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      </Stack>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="settings" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
