import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function UserListScreen(params:any) {
  return <View><Text>Hi </Text></View>
}

const Tab = createBottomTabNavigator();

export default function Chat() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            height: 70,
            position: 'absolute',
            backgroundColor: '#fff',
            borderTopWidth: 0,
            elevation: 10,
            borderRadius: 20,
            marginHorizontal: 16,
            marginBottom: 10,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName :any = 'home-outline';
            if (route.name === 'Home') iconName = 'home-outline';
            else if (route.name === 'Friends') iconName = 'people-outline';
            else if (route.name === 'Inbox') iconName = 'chatbubble-ellipses-outline';
            else if (route.name === 'Profile') iconName = 'person-outline';

            return <Ionicons name={iconName} size={24} color={focused ? '#007AFF' : '#999'} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={UserListScreen} />
        <Tab.Screen name="Friends" component={UserListScreen} />
        <Tab.Screen
          name="CenterButton"
          component={UserListScreen}
          options={{
            // tabBarButton: (props) => (
            //   <TouchableOpacity style={styles.centerButton} {...props}>
            //     <View><Ionicons name="add" size={28} color="#fff" /></View>
            //   </TouchableOpacity>
            // ),
          }}
        />
        <Tab.Screen name="Inbox" component={UserListScreen} />
        <Tab.Screen name="Profile" component={UserListScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
});
