import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);

  const handleAdminLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        router.replace('/(admin)/dashboard' as any);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleClientLogin = () => {
    router.replace('/(client)/appointments');
  };

  return (
    <View style={styles.container}>
      <View style={styles.switchContainer}>
        <TouchableOpacity 
          style={[styles.switchButton, isAdmin && styles.activeSwitchButton]} 
          onPress={() => setIsAdmin(true)}
        >
          <Text style={[styles.switchText, isAdmin && styles.activeText]}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.switchButton, !isAdmin && styles.activeSwitchButton]}
          onPress={() => setIsAdmin(false)}
        >
          <Text style={[styles.switchText, !isAdmin && styles.activeText]}>Client</Text>
        </TouchableOpacity>
      </View>

      {isAdmin ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleAdminLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleClientLogin}>
            <Text style={styles.buttonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 5,
  },
  switchButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeSwitchButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  switchText: {
    fontSize: 16,
    color: '#666',
  },
  activeText: {
    color: '#000',
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});