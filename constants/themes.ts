export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgImage?: string;
  sent: string;
  sentText: string;
  received: string;
  receivedText: string;
  text: string;
  textSecondary: string;
  time: string;
  sentTime: string;
  receivedTime: string;
  inputBg: string;
  inputBorder: string;
  imageOverlay?: string;
  fontFamily: string;
  headerBg: string;
  headerText: string;
  cardBg: string;
  border: string;
  button: string;
  inputText: string;
  shadowColor: string;
  modalBg: string;
  iconColor: string;
  badgeColor: string;
  avatarBroder: string; // new property
}

export interface Theme {
  name: string;
  dark: ThemeColors;
  light: ThemeColors;
}

export type Themes = Record<string, Theme>;

export const themes: Themes = {
  jade: {
    name: 'Jade',
    dark: {
      bg: '#0A0F0D',
      bgSecondary: '#0A0F0D',
      bgImage: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800&q=80',
      sent: '#00A86B',
      sentText: '#c4e1d4ff',
      received: '#c4dbd0ff',
      receivedText: '#121E18',
      text: '#E8F5E9',
      textSecondary: '#E8F5E9',
      time: '#777',
      sentTime: '#777',
      receivedTime: '#777',
      inputBg: '#27312deb',
      inputBorder: '#00A86B44',
      imageOverlay: '#00000059',
      fontFamily: 'System',
      headerBg: '#08120C',
      headerText: '#E8F5E9',
      cardBg: '#121E18',
      border: '#00A86B33',
      button: '#00A86B',
      inputText: '#00A86B',
      shadowColor: '#00000080',
      modalBg: '#121E18',
      iconColor: '#00D48A',
      badgeColor: '#00A86B',
      avatarBroder: '#00A86B',
    },
    light: {
      bg: '#F0FDF4',
      bgSecondary: '#dcfae5ff',
      sent: '#16A34A',
      sentText: '#ffffffff',
      received: '#DCFCE7',
      receivedText: '#222',
      text: '#0F1A12',
      textSecondary: '#7ba486ff',
      time: '#959595dd',
      sentTime: '#dbdbdbdd',
      receivedTime: '#777',
      inputBg: '#fffffff2',
      inputBorder: '#16A34A44',
      fontFamily: 'System',
      headerBg: '#E6F6EB',
      headerText: '#0F1A12',
      cardBg: '#DCFCE7',
      border: '#16A34A44',
      button: '#16A34A',
      inputText: '#327d45ff',
      shadowColor: 'rgba(255,255,255,0.5)',
      modalBg: '#d3f6d3ff',
      iconColor: '#059669',
      badgeColor: '#059669',
      avatarBroder: '#16A34A',
    },
  }
};

export default themes;
