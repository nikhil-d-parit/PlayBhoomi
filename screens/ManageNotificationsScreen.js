import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  DataTable,
  Chip,
} from 'react-native-paper';
import axios from 'axios';

const ManageNotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'specific', 'history'
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  // Send to all users form
  const [allUsersForm, setAllUsersForm] = useState({ title: '', message: '' });

  // Send to specific user form
  const [specificUserForm, setSpecificUserForm] = useState({
    userId: '',
    title: '',
    message: '',
  });

  // Fetch notification history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/notifications/history`);
      setHistory(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Send notification to all users
  const handleSendToAll = async () => {
    if (!allUsersForm.title || !allUsersForm.message) {
      setSnackbar({ visible: true, message: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/notifications/send`,
        allUsersForm
      );

      setSnackbar({
        visible: true,
        message: `Notification sent to ${response.data.usersCount} users!`,
      });

      setAllUsersForm({ title: '', message: '' });
      fetchHistory();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || 'Failed to send notification',
      });
    } finally {
      setLoading(false);
    }
  };

  // Send notification to specific user
  const handleSendToUser = async () => {
    if (!specificUserForm.userId || !specificUserForm.title || !specificUserForm.message) {
      setSnackbar({ visible: true, message: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/notifications/send-to-user`,
        specificUserForm
      );

      setSnackbar({ visible: true, message: 'Notification sent successfully!' });
      setSpecificUserForm({ userId: '', title: '', message: '' });
      fetchHistory();
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error.response?.data?.message || 'Failed to send notification',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text variant="headlineMedium" style={styles.header}>
          Manage Notifications
        </Text>

        {/* Tab Buttons */}
        <View style={styles.tabContainer}>
          <Chip
            selected={activeTab === 'all'}
            onPress={() => setActiveTab('all')}
            style={styles.chip}
          >
            Send to All
          </Chip>
          <Chip
            selected={activeTab === 'specific'}
            onPress={() => setActiveTab('specific')}
            style={styles.chip}
          >
            Send to User
          </Chip>
          <Chip
            selected={activeTab === 'history'}
            onPress={() => setActiveTab('history')}
            style={styles.chip}
          >
            History
          </Chip>
        </View>

        {/* Tab 1: Send to All Users */}
        {activeTab === 'all' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Send Notification to All Users
              </Text>
              <TextInput
                label="Title"
                value={allUsersForm.title}
                onChangeText={(text) => setAllUsersForm({ ...allUsersForm, title: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., New Feature Available!"
              />
              <TextInput
                label="Message"
                value={allUsersForm.message}
                onChangeText={(text) => setAllUsersForm({ ...allUsersForm, message: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="e.g., Check out our new booking features..."
              />
              <Button
                mode="contained"
                onPress={handleSendToAll}
                loading={loading}
                disabled={loading}
                style={styles.button}
                icon="send"
              >
                Send to All Users
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Tab 2: Send to Specific User */}
        {activeTab === 'specific' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Send Notification to Specific User
              </Text>
              <TextInput
                label="User ID"
                value={specificUserForm.userId}
                onChangeText={(text) => setSpecificUserForm({ ...specificUserForm, userId: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Enter Firebase User ID"
              />
              <TextInput
                label="Title"
                value={specificUserForm.title}
                onChangeText={(text) => setSpecificUserForm({ ...specificUserForm, title: text })}
                mode="outlined"
                style={styles.input}
                placeholder="e.g., Your Booking is Confirmed"
              />
              <TextInput
                label="Message"
                value={specificUserForm.message}
                onChangeText={(text) => setSpecificUserForm({ ...specificUserForm, message: text })}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="e.g., Your booking for Cricket Ground..."
              />
              <Button
                mode="contained"
                onPress={handleSendToUser}
                loading={loading}
                disabled={loading}
                style={styles.button}
                icon="send"
              >
                Send Notification
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Notification History
              </Text>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>No notifications sent yet</Text>
              ) : (
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Type</DataTable.Title>
                    <DataTable.Title>Title</DataTable.Title>
                  </DataTable.Header>

                  {history.slice(0, 20).map((notification) => (
                    <DataTable.Row key={notification.id}>
                      <DataTable.Cell>
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </DataTable.Cell>
                      <DataTable.Cell>
                        {notification.type === 'admin_announcement' ? 'All' : 'User'}
                      </DataTable.Cell>
                      <DataTable.Cell>{notification.title}</DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbar({ ...snackbar, visible: false }),
        }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 10,
  },
  chip: {
    marginRight: 8,
  },
  card: {
    margin: 20,
    marginTop: 10,
  },
  cardTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
});

export default ManageNotificationsScreen;
