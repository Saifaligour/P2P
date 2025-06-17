import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Modal } from 'react-native';
import { QRCodeScanner } from '../ui/QRCodeScanner';

interface JoinGroupFormProps {
  joinGroupName: string;
  onChangeGroupName: (name: string) => void;
  onSubmit: () => void;
  onScanQRCode: (data: string) => void;
}

export const JoinGroupForm: React.FC<JoinGroupFormProps> = ({
  joinGroupName,
  onChangeGroupName,
  onSubmit,
  onScanQRCode,
}) => {
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleScan = (data: string) => {
    setScannerVisible(false);
    if (data) onScanQRCode(data);
  };

  return (
    <>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        value={joinGroupName}
        onChangeText={onChangeGroupName}
      />
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
        <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, { flex: 1, backgroundColor: '#687076' }]}
          onPress={() => setScannerVisible(true)}
          accessibilityLabel="Scan QR Code"
          accessibilityRole="button"
        >
          <Text style={styles.submitBtnText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={scannerVisible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <QRCodeScanner onScan={handleScan} />
        <TouchableOpacity style={{ padding: 20, alignItems: 'center', backgroundColor: '#222' }} onPress={() => setScannerVisible(false)}>
          <Text style={{ color: '#fff', fontSize: 18 }}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 18,
    color: '#222',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 30,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
