import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../../firebase/config';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { BarChart2, TrendingUp, DollarSign, Users } from 'lucide-react-native';

interface DailyStats {
  date: string;
  revenue: number;
  appointments: number;
}

export default function ReportsScreen() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [averageRevenue, setAverageRevenue] = useState(0);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Get data for the last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );

      const querySnapshot = await getDocs(q);
      const appointments = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        date: doc.data().date.toDate(),
      }));

      // Process data by day
      const dailyData: { [key: string]: DailyStats } = {};
      let totalRev = 0;
      let totalAppts = appointments.length;

      appointments.forEach(appointment => {
        const dateStr = appointment.date.toISOString().split('T')[0];
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = {
            date: dateStr,
            revenue: 0,
            appointments: 0,
          };
        }
        dailyData[dateStr].appointments += 1;
        dailyData[dateStr].revenue += 50; // Assuming fixed price per appointment
        totalRev += 50;
      });

      const stats = Object.values(dailyData).sort((a, b) => 
        a.date.localeCompare(b.date)
      );

      setDailyStats(stats);
      setTotalRevenue(totalRev);
      setTotalAppointments(totalAppts);
      setAverageRevenue(totalRev / 7);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 35, 126, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BarChart2 size={24} color="#1a237e" />
        <Text style={styles.headerText}>Analytics Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <DollarSign size={24} color="#4caf50" />
            <Text style={styles.statValue}>${totalRevenue}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#2196f3" />
            <Text style={styles.statValue}>{totalAppointments}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#ff9800" />
            <Text style={styles.statValue}>${averageRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Avg. Daily Revenue</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <LineChart
            data={{
              labels: dailyStats.map(stat => stat.date.split('-')[2]),
              datasets: [{
                data: dailyStats.map(stat => stat.revenue)
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Appointments</Text>
          <BarChart
            data={{
              labels: dailyStats.map(stat => stat.date.split('-')[2]),
              datasets: [{
                data: dailyStats.map(stat => stat.appointments)
              }]
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      </ScrollView>
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
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});