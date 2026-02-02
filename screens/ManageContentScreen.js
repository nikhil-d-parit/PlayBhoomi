import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const ManageContentScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('help'); // 'help' or 'terms'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Help & Support State
  const [helpContent, setHelpContent] = useState({
    greeting: '',
    contactOptions: [],
    faqs: [],
    supportHours: '',
  });

  // Terms & Conditions State
  const [termsContent, setTermsContent] = useState({
    title: '',
    lastUpdated: '',
    sections: [],
    contactEmail: '',
  });

  // Modal states
  const [faqModalVisible, setFaqModalVisible] = useState(false);
  const [sectionModalVisible, setSectionModalVisible] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [editingSection, setEditingSection] = useState(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const [helpRes, termsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/content/help-support`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/admin/content/terms-conditions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setHelpContent(helpRes.data);
      setTermsContent(termsRes.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveHelpContent = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');

      await axios.put(
        `${API_URL}/admin/content/help-support`,
        helpContent,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Help & Support content updated successfully');
    } catch (error) {
      console.error('Error saving help content:', error);
      Alert.alert('Error', 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const saveTermsContent = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');

      await axios.put(
        `${API_URL}/admin/content/terms-conditions`,
        termsContent,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Terms & Conditions updated successfully');
    } catch (error) {
      console.error('Error saving terms content:', error);
      Alert.alert('Error', 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const updateContactOption = (index, field, value) => {
    const updated = [...helpContent.contactOptions];
    updated[index] = { ...updated[index], [field]: value };
    setHelpContent({ ...helpContent, contactOptions: updated });
  };

  const addFaq = () => {
    setEditingFaq({ id: Date.now(), question: '', answer: '' });
    setFaqModalVisible(true);
  };

  const editFaq = (faq) => {
    setEditingFaq({ ...faq });
    setFaqModalVisible(true);
  };

  const saveFaq = () => {
    if (!editingFaq.question || !editingFaq.answer) {
      Alert.alert('Error', 'Please fill in both question and answer');
      return;
    }

    const existingIndex = helpContent.faqs.findIndex(f => f.id === editingFaq.id);
    const updatedFaqs = [...helpContent.faqs];

    if (existingIndex >= 0) {
      updatedFaqs[existingIndex] = editingFaq;
    } else {
      updatedFaqs.push(editingFaq);
    }

    setHelpContent({ ...helpContent, faqs: updatedFaqs });
    setFaqModalVisible(false);
    setEditingFaq(null);
  };

  const deleteFaq = (id) => {
    Alert.alert('Delete FAQ', 'Are you sure you want to delete this FAQ?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setHelpContent({
            ...helpContent,
            faqs: helpContent.faqs.filter(f => f.id !== id),
          });
        },
      },
    ]);
  };

  const addSection = () => {
    setEditingSection({ id: Date.now(), title: '', content: '' });
    setSectionModalVisible(true);
  };

  const editSection = (section) => {
    setEditingSection({ ...section });
    setSectionModalVisible(true);
  };

  const saveSection = () => {
    if (!editingSection.title || !editingSection.content) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    const existingIndex = termsContent.sections.findIndex(s => s.id === editingSection.id);
    const updatedSections = [...termsContent.sections];

    if (existingIndex >= 0) {
      updatedSections[existingIndex] = editingSection;
    } else {
      updatedSections.push(editingSection);
    }

    setTermsContent({ ...termsContent, sections: updatedSections });
    setSectionModalVisible(false);
    setEditingSection(null);
  };

  const deleteSection = (id) => {
    Alert.alert('Delete Section', 'Are you sure you want to delete this section?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setTermsContent({
            ...termsContent,
            sections: termsContent.sections.filter(s => s.id !== id),
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'help' && styles.activeTab]}
          onPress={() => setActiveTab('help')}
        >
          <Text style={[styles.tabText, activeTab === 'help' && styles.activeTabText]}>
            Help & Support
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'help' ? (
          <View>
            {/* Greeting */}
            <View style={styles.section}>
              <Text style={styles.label}>Greeting Message</Text>
              <TextInput
                style={styles.input}
                value={helpContent.greeting}
                onChangeText={(text) => setHelpContent({ ...helpContent, greeting: text })}
                placeholder="Enter greeting message"
              />
            </View>

            {/* Contact Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Options</Text>
              {helpContent.contactOptions.map((option, index) => (
                <View key={option.id} style={styles.contactCard}>
                  <Text style={styles.cardLabel}>{option.title}</Text>
                  <TextInput
                    style={styles.input}
                    value={option.subtitle}
                    onChangeText={(text) => updateContactOption(index, 'subtitle', text)}
                    placeholder="Contact detail"
                  />
                  {option.type === 'whatsapp' && (
                    <TextInput
                      style={styles.input}
                      value={option.whatsappNumber}
                      onChangeText={(text) => updateContactOption(index, 'whatsappNumber', text)}
                      placeholder="WhatsApp number"
                    />
                  )}
                </View>
              ))}
            </View>

            {/* FAQs */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>FAQs</Text>
                <TouchableOpacity onPress={addFaq} style={styles.addButton}>
                  <Ionicons name="add-circle" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {helpContent.faqs.map((faq) => (
                <View key={faq.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemQuestion}>{faq.question}</Text>
                    <Text style={styles.itemAnswer} numberOfLines={2}>
                      {faq.answer}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => editFaq(faq)}>
                      <Ionicons name="pencil" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteFaq(faq.id)} style={{ marginLeft: 12 }}>
                      <Ionicons name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Support Hours */}
            <View style={styles.section}>
              <Text style={styles.label}>Support Hours</Text>
              <TextInput
                style={styles.input}
                value={helpContent.supportHours}
                onChangeText={(text) => setHelpContent({ ...helpContent, supportHours: text })}
                placeholder="e.g., Monday - Friday: 9 AM - 5 PM"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveHelpContent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Help & Support</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Terms Title */}
            <View style={styles.section}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={termsContent.title}
                onChangeText={(text) => setTermsContent({ ...termsContent, title: text })}
                placeholder="e.g., Terms & Conditions"
              />
            </View>

            {/* Last Updated */}
            <View style={styles.section}>
              <Text style={styles.label}>Last Updated</Text>
              <TextInput
                style={styles.input}
                value={termsContent.lastUpdated}
                onChangeText={(text) => setTermsContent({ ...termsContent, lastUpdated: text })}
                placeholder="e.g., January 28, 2026"
              />
            </View>

            {/* Sections */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Sections</Text>
                <TouchableOpacity onPress={addSection} style={styles.addButton}>
                  <Ionicons name="add-circle" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              {termsContent.sections.map((section) => (
                <View key={section.id} style={styles.itemCard}>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemQuestion}>{section.title}</Text>
                    <Text style={styles.itemAnswer} numberOfLines={3}>
                      {section.content}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => editSection(section)}>
                      <Ionicons name="pencil" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSection(section.id)}
                      style={{ marginLeft: 12 }}
                    >
                      <Ionicons name="trash" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Contact Email */}
            <View style={styles.section}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                value={termsContent.contactEmail}
                onChangeText={(text) => setTermsContent({ ...termsContent, contactEmail: text })}
                placeholder="support@example.com"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveTermsContent}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Terms & Conditions</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAQ Modal */}
      <Modal visible={faqModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFaq?.question ? 'Edit FAQ' : 'Add FAQ'}
            </Text>

            <Text style={styles.label}>Question</Text>
            <TextInput
              style={styles.input}
              value={editingFaq?.question}
              onChangeText={(text) => setEditingFaq({ ...editingFaq, question: text })}
              placeholder="Enter question"
            />

            <Text style={styles.label}>Answer</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={editingFaq?.answer}
              onChangeText={(text) => setEditingFaq({ ...editingFaq, answer: text })}
              placeholder="Enter answer"
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setFaqModalVisible(false);
                  setEditingFaq(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={saveFaq}>
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Section Modal */}
      <Modal visible={sectionModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSection?.title ? 'Edit Section' : 'Add Section'}
            </Text>

            <Text style={styles.label}>Section Title</Text>
            <TextInput
              style={styles.input}
              value={editingSection?.title}
              onChangeText={(text) => setEditingSection({ ...editingSection, title: text })}
              placeholder="e.g., 1. Acceptance of Terms"
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={editingSection?.content}
              onChangeText={(text) => setEditingSection({ ...editingSection, content: text })}
              placeholder="Enter section content"
              multiline
              numberOfLines={6}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSectionModalVisible(false);
                  setEditingSection(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={saveSection}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  addButton: {
    padding: 4,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemAnswer: {
    fontSize: 12,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ManageContentScreen;
