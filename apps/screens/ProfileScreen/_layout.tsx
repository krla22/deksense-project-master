import { View, Text, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, Stack, useRouter } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'

export default function _layout() {
    const router = useRouter();
  return (
    <Stack 
        screenOptions={{
            headerShown: true
        }}
    >
        <Stack.Screen 
            name='Profile' 
            options={{
                headerTitle: "Profile", 
                headerBackVisible: false,
                headerRight: () => <Button title='Return' onPress={() => router.push('/(drawer)/dashboard')} />
            }}
        />
    </Stack>
  )
}