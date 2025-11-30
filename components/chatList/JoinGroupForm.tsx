import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const { theme, s } = useThemeColor();

  const handleScan = (data: string) => {
    setScannerVisible(false);
    if (data) onScanQRCode(data);
  };

  const styles = React.useMemo(() => StyleSheet.create({
    label: { fontSize: s(16), fontWeight: '600', marginBottom: s(6), marginTop: s(18), color: theme.text },
    input: {
      backgroundColor: theme.inputBg, borderRadius: s(30), paddingHorizontal: s(20),
      paddingVertical: s(16), fontSize: s(16), marginBottom: s(8), borderWidth: 1, borderColor: theme.inputBorder, color: theme.inputText
    },
    submitBtn: { backgroundColor: theme.sent, borderRadius: s(39), paddingVertical: s(14), alignItems: 'center', marginTop: s(30) },
    submitBtnText: { color: theme.sentText, fontSize: s(18), fontWeight: '700' },
    qrBtn: { backgroundColor: theme.bgSecondary },
  }), [theme, s]);

  return (
    <>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter group name"
        placeholderTextColor={theme.inputText}
        value={joinGroupName}
        onChangeText={onChangeGroupName}
      />
      <View style={{ flexDirection: 'row', gap: s(16), marginTop: s(16) }}>
        <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={onSubmit}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, { flex: 1, ...styles.qrBtn }]}
          onPress={() => setScannerVisible(true)}
        >
          <Text style={styles.submitBtnText}>Scan QR Code</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={scannerVisible} animationType="slide" onRequestClose={() => setScannerVisible(false)}>
        <QRCodeScanner onScan={handleScan} />
        <TouchableOpacity style={{ padding: s(20), alignItems: 'center', backgroundColor: theme.bgSecondary }} onPress={() => setScannerVisible(false)}>
          <Text style={{ color: theme.text, fontSize: s(18) }}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
