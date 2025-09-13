import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
} from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddBookingScreen = () => {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    price: '',
    transactionId: '',
    date: '',
    paymentStatus: '',
    turf: '',
    court: '',
    slot: '',
    sport: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    paymentStatus: false,
    turf: false,
    court: false,
    slot: false,
    sport: false,
  });

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toLocaleDateString('en-GB');
      setForm({ ...form, date: formatted });
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Name & Mobile */}
      <View style={styles.row}>
        <TextInput
          label="Name *"
          value={form.name}
          onChangeText={text => handleChange('name', text)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Mobile *"
          value={form.mobile}
          onChangeText={text => handleChange('mobile', text)}
          keyboardType="phone-pad"
          mode="outlined"
          style={styles.input}
        />
      </View>

      {/* Price & Date */}
      <View style={styles.row}>
        <TextInput
          label="Price *"
          value={form.price}
          onChangeText={text => handleChange('price', text)}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Date *"
          value={form.date}
          mode="outlined"
          onFocus={() => setShowDatePicker(true)}
          style={styles.input}
        />
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Payment Status & Transaction ID */}
      <View style={styles.row}>
        <Dropdown
          label="Payment Status"
          mode="outlined"
          visible={dropdowns.paymentStatus}
          showDropDown={() => setDropdowns({ ...dropdowns, paymentStatus: true })}
          onDismiss={() => setDropdowns({ ...dropdowns, paymentStatus: false })}
          value={form.paymentStatus}
          setValue={value => handleChange('paymentStatus', value)}
          options={[
            { label: 'Paid', value: 'Paid' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Failed', value: 'Failed' },
          ]}
          inputProps={{ style: styles.input }}
        />
        <TextInput
          label="Transaction ID"
          value={form.transactionId}
          onChangeText={text => handleChange('transactionId', text)}
          mode="outlined"
          style={styles.input}
        />
      </View>

      {/* Turf & Court */}
      <View style={styles.row}>
        <Dropdown
          label="Turf"
          mode="outlined"
          visible={dropdowns.turf}
          showDropDown={() => setDropdowns({ ...dropdowns, turf: true })}
          onDismiss={() => setDropdowns({ ...dropdowns, turf: false })}
          value={form.turf}
          setValue={value => handleChange('turf', value)}
          options={[{ label: 'Turf A', value: 'Turf A' }, { label: 'Turf B', value: 'Turf B' }]}
          inputProps={{ style: styles.input }}
        />
        <Dropdown
          label="Court"
          mode="outlined"
          visible={dropdowns.court}
          showDropDown={() => setDropdowns({ ...dropdowns, court: true })}
          onDismiss={() => setDropdowns({ ...dropdowns, court: false })}
          value={form.court}
          setValue={value => handleChange('court', value)}
          options={[{ label: 'Court 1', value: 'Court 1' }, { label: 'Court 2', value: 'Court 2' }]}
          inputProps={{ style: styles.input }}
        />
      </View>

      {/* Slot & Sport */}
      <View style={styles.row}>
        <Dropdown
          label="Slot"
          mode="outlined"
          visible={dropdowns.slot}
          showDropDown={() => setDropdowns({ ...dropdowns, slot: true })}
          onDismiss={() => setDropdowns({ ...dropdowns, slot: false })}
          value={form.slot}
          setValue={value => handleChange('slot', value)}
          options={[{ label: '6-7 AM', value: '6-7 AM' }, { label: '7-8 AM', value: '7-8 AM' }]}
          inputProps={{ style: styles.input }}
        />
        <Dropdown
          label="Sport"
          mode="outlined"
          visible={dropdowns.sport}
          showDropDown={() => setDropdowns({ ...dropdowns, sport: true })}
          onDismiss={() => setDropdowns({ ...dropdowns, sport: false })}
          value={form.sport}
          setValue={value => handleChange('sport', value)}
          options={[{ label: 'Football', value: 'Football' }, { label: 'Cricket', value: 'Cricket' }]}
          inputProps={{ style: styles.input }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button mode="outlined" style={{ marginRight: 8 }}>
          Cancel
        </Button>
        <Button mode="contained" onPress={() => console.log(form)}>
          Add Booking
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    margin: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
});

export default AddBookingScreen;
