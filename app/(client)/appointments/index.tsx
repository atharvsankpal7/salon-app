import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../firebase/config';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { Calendar } from 'lucide-react-native';

const SLOTS_PER_TIME = 2; // Number of appointments possible per time slot
const APPOINTMENT_DURATION = 60; // Duration in minutes
const SALON_START_TIME = 9; // 9 AM
const SALON_END_TIME = 18; // 6 PM

interface TimeSlot {
  time: string;
  available: number;
  bookedBy: string[];
}

export default function AppointmentBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate]);

  const fetchTimeSlots = async () => {
    const slots: TimeSlot[] = [];
    const startTime = new Date(selectedDate);
    startTime.setHours(SALON_START_TIME, 0, 0, 0);

    // Generate time slots
    while (startTime.getHours() < SALON_END_TIME) {
      const timeString = startTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      slots.push({
        time: timeString,
        available: SLOTS_PER_TIME,
        bookedBy: []
      });

      startTime.setMinutes(startTime.getMinutes() + APPOINTMENT_DURATION);
    }

    // Fetch booked appointments
    const appointmentsRef = collection(db, 'appointments');
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
      appointmentsRef,
      where('date', '>=', Timestamp.fromDate(startOfDay)),
      where('date', '<=', Timestamp.fromDate(endOfDay))
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const appointment = doc.data();
      const slotIndex = slots.findIndex(slot => slot.time === appointment.time);
      if (slotIndex !== -1) {
        slots[slotIndex].available--;
        slots[slotIndex].bookedBy.push(appointment.clientName);
      }
    });

    setTimeSlots(slots);
  };

  const handleSlotPress = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  const bookAppointment = async () => {
    if (!selectedSlot) return;

    try {
      const appointmentDate = new Date(selectedDate);
      const [hours, minutes] = selectedSlot.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await addDoc(collection(db, 'appointments'), {
        date: Timestamp.fromDate(appointmentDate),
        time: selectedSlot.time,
        clientName: 'John Doe', // Replace with actual client name
        clientId: 'user123', // Replace with actual client ID
        status: 'booked'
      });

      setModalVisible(false);
      fetchTimeSlots();
    } catch (error) {
      console.error('Error booking appointment:', error);
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
        <Text style={styles.headerText}>Book Appointment</Text>
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

      <ScrollView style={styles.slotsContainer}>
        {timeSlots.map((slot, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.slot,
              { opacity: slot.available > 0 ? 1 : 0.5 }
            ]}
            onPress={() => slot.available > 0 && handleSlotPress(slot)}
            disabled={slot.available === 0}>
            <Text style={styles.slotTime}>{slot.time}</Text>
            <Text style={styles.slotAvailability}>
              {slot.available} {slot.available === 1 ? 'spot' : 'spots'} available
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Appointment</Text>
            <Text style={styles.modalText}>
              Book appointment for {selectedSlot?.time}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={bookAppointment}>
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
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
  slotsContainer: {
    padding: 10,
  },
  slot: {
    backgroundColor: '#fff',
    padding: 20,
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
  slotTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  slotAvailability: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
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
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a237e',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  confirmButton: {
    backgroundColor: '#4caf50',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});