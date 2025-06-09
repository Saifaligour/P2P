// import { Ionicons } from '@expo/vector-icons';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import React from 'react';
// import UserListScreen from "./index";
// const Tab = createBottomTabNavigator();

// export default function Chat() {
//   return (
    
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           tabBarPosition: 'top',
//           tabBarShowLabel: false,
//           headerShown: false,
//           tabBarStyle: {
//             // height: 70,
//             // position: 'absolute',
//             backgroundColor: '#fff',
//             borderTopWidth: 0,
//             elevation: 2,
//             borderRadius: 5,
//             marginHorizontal: 6,
//             // marginBottom: 10,
//           },
//           tabBarIcon: ({ focused, color, size }) => {
//             let iconName :any = 'home-outline';
//             if (route.name === 'Home') iconName = 'home-outline';
//             else if (route.name === 'Friends') iconName = 'people-outline';
//             else if (route.name === 'Inbox') iconName = 'chatbubble-ellipses-outline';
//             else if (route.name === 'Profile') iconName = 'person-outline';

//             return <Ionicons name={iconName} size={24} color={focused ? '#007AFF' : '#999'} />;
//           },
//         })}
//       >
//         <Tab.Screen name="Home" component={UserListScreen} />
//         <Tab.Screen name="Friends" component={UserListScreen} />
//         <Tab.Screen
//           name="CenterButton"
//           component={UserListScreen}
//           options={{
//             // tabBarButton: (props) => (
//             //   <TouchableOpacity style={styles.centerButton} {...props}>
//             //     <View><Ionicons name="add" size={28} color="#fff" /></View>
//             //   </TouchableOpacity>
//             // ),
//           }}
//         />
//         <Tab.Screen name="Inbox" component={UserListScreen} />
//         <Tab.Screen name="Profile" component={UserListScreen} />
//       </Tab.Navigator>
//   );
// }

