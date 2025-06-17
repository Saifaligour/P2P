import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// You can use expo-barcode-scanner or expo-camera for real QR scanning
// This is a placeholder for the QR code scanner UI

export const QRCodeScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  // TODO: Integrate with expo-barcode-scanner or similar
  return (
    <View style={styles.container}>
      <Text style={styles.text}>QR Code Scanner Placeholder</Text>
      {/* Add real scanner logic here and call onScan(data) when a QR is scanned */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
});
