import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Calendar, Clock, User } from 'lucide-react-native';

interface Appointment {
  id: string;
  date: Timestamp;
  time: string;
  clientName: string;
  clientId: string;
  status: string;
}

interface TimeSlot {
  time: string;
  appointments: Appointment[];
}

export default function AdminAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<TimeSlot[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const fetchedAppointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        fetchedAppointments.push({
          id: doc.id,
          ...doc.data() as Omit<Appointment, 'id'>
        });
      });

      // Group appointments by time
      const groupedAppointments: { [key: string]: Appointment[] } = {};
      fetchedAppointments.forEach(appointment => {
        if (!groupedAppointments[appointment.time]) {
          groupedAppointments[appointment.time] = [];
        }
        groupedAppointments[appointment.time].push(appointment);
      });

      const timeSlots = Object.keys(groupedAppointments).sort().map(time => ({
        time,
        appointments: groupedAppointments[time]
      }));

      setAppointments(timeSlots);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Calendar size={24} color="#1a237e" />
        <Text style={styles.headerText}>Appointments</Text>
      </View>

      <View style={styles.dateSelector}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <View style={styles.dateControls}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}>
            <Text style={styles.dateButtonText}>Previous Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}>
            <Text style={styles.dateButtonText}>Next Day</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.appointmentsContainer}>
        {appointments.map((slot, index) => (
          <View key={index} style={styles.timeSlot}>
            <View style={styles.timeHeader}>
              <Clock size={20} color="#1a237e" />
              <Text style={styles.timeText}>{slot.time}</Text>
            </View>
            {slot.appointments.map((appointment, appIndex) => (
              <TouchableOpacity
                key={appIndex}
                style={styles.appointment}
                onPress={() => {
                  setSelectedAppointment(appointment);
                  setModalVisible(true);
                }}>
                <User size={20} color="#666" />
                <Text style={styles.clientName}>{appointment.clientName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            {selectedAppointment && (
              <>
                <Text style={styles.modalText}>Client: {selectedAppointment.clientName}</Text>
                <Text style={styles.modalText}>Time: {selectedAppointment.time}</Text>
                <Text style={styles.modalText}>Status: {selectedAppointment.status}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1a237e',
  },
  dateSelector: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#e8eaf6',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  dateButtonText: {
    color: '#1a237e',
    textAlign: 'center',
    fontWeight: '600',
  },
  appointmentsContainer: {
    padding: 10,
  },
  timeSlot: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#1a237e',
  },
  appointment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 5,
  },
  clientName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a237e',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#1a237e',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});