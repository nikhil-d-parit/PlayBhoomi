import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import {
  TextInput,
  Button,
  Surface,
  Checkbox,
  Switch,
  IconButton,
  Chip,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { fetchVendors } from "../redux/slices/VenderSlice";
import { fetchAmenities } from "../redux/slices/AmenitiesSlice";
import { fetchRules } from "../redux/slices/RulesSlice";
import { editVenue } from "../redux/slices/VenuesSlice";
import { fetchVenues } from "../redux/slices/VenuesSlice";
import { useFocusEffect } from "@react-navigation/native";
const screenW = Dimensions.get("window").width;
import Toast from "react-native-toast-message";

const times = [
  "06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00",
];
const sportsOptions = ["Football", "Cricket", "Badminton", "Tennis"];
const courtOptions = ["Court A", "Court B", "Court C", "Pitch 1", "Pitch 2"];

const CustomPicker = ({ selectedValue, onValueChange, items, placeholder }) => (
  <View style={styles.pickerWrapper}>
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      style={styles.picker}
      mode="dropdown"
    >
      <Picker.Item label={placeholder} value="" />
      {items.map((it, idx) => {
        if (typeof it === "string") {
          return <Picker.Item key={idx} label={it} value={it} />;
        }
        if (it.label && it.value) {
          return <Picker.Item key={it.value} label={it.label} value={it.value} />;
        }
        return <Picker.Item key={it.id} label={it.name} value={it.id} />;
      })}
    </Picker>
  </View>
);

const EditVenueScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const vendorList = useSelector((state) => state.vender.vendors);
  const aminitiesList = useSelector((state) => state.amenities.amenities);
  const rulesList = useSelector((state) => state.rules.rules);
  const venues = useSelector((state) => state.venues.venues);
  const { vendorId, turfId } = route.params;
  const [formErrors, setFormErrors] = useState({});

  // Robust filter for currentVenue
  const currentVenue = React.useMemo(() => {
    if (!Array.isArray(venues)) return undefined;
    // Find venue by turfId
    const venue = venues.find(v => v.turfId === turfId || v.id === turfId);
    if (venue) {
      // Map API response fields to form fields
      return {
        vendorId: vendorId || venue.vendorName || venue.vendorId || "",
        title: venue.title || "",
        address: venue.location?.address || "",
        city: venue.location?.city || "",
        description: venue.description || "",
        phone: venue.phone || "",
        courtsCount: venue.courtsCount || 0,
        openTime: venue.openTime || "",
        closeTime: venue.closeTime || "",
        images: venue.thumbnail ? [venue.thumbnail] : [],
        // Default values for fields not present in response
        sports: venue.sports || [
          {
            name: "",
            slotPrice: "",
            discountedPrice: "",
            weekendPrice: "",
            timeSlots: [{ open: "", close: "" }],
            courts: [],
          },
        ],
        amenities: venue.amenities || [],
        rules: venue.rules || [],
        cancellationHours: venue.cancellationHours?.toString() || "24",
        featured: venue.featured || 0,
      };
    }
    return undefined;
  }, [venues, vendorId, turfId]);

  // Always use the latest venue from Redux store (robust filter above)
  const [form, setForm] = useState(() => {
    if (currentVenue) {
      return {
        vendorId: vendorId || currentVenue.vendorId || "",
        title: currentVenue.title || "",
        address: currentVenue.address || "",
        description: currentVenue.description || "",
        sports: currentVenue.sports || [
          {
            name: "",
            slotPrice: "",
            discountedPrice: "",
            weekendPrice: "",
            timeSlots: [{ open: "", close: "" }],
            courts: [],
          },
        ],
        amenities: currentVenue.amenities || [],
        rules: currentVenue.rules || [],
        images: currentVenue.images || [],
        cancellationHours: currentVenue.cancellationHours?.toString() || "24",
        featured: currentVenue.featured || 0,
        phone: currentVenue.phone || "",
        city: currentVenue.city || "",
        courtsCount: currentVenue.courtsCount || 0,
        openTime: currentVenue.openTime || "",
        closeTime: currentVenue.closeTime || "",
      };
    }
    // fallback if no venue found
    return {
      vendorId: vendorId || "",
      title: "",
      address: "",
      description: "",
      sports: [
        {
          name: "",
          slotPrice: "",
          discountedPrice: "",
          weekendPrice: "",
          timeSlots: [{ open: "", close: "" }],
          courts: [],
        },
      ],
      amenities: [],
      rules: [],
      images: [],
      cancellationHours: "24",
      featured: 0,
      phone: "",
      city: "",
      courtsCount: 0,
      openTime: "",
      closeTime: "",
    };
  });

  // Re-initialize form when currentVenue changes (after venues are loaded)
  useEffect(() => {
    if (currentVenue) {
      setForm({
        vendorId: vendorId || currentVenue.vendorId || "",
        title: currentVenue.title || "",
        address: currentVenue.address || "",
        description: currentVenue.description || "",
        sports: currentVenue.sports || [
          {
            name: "",
            slotPrice: "",
            discountedPrice: "",
            weekendPrice: "",
            timeSlots: [{ open: "", close: "" }],
            courts: [],
          },
        ],
        amenities: currentVenue.amenities || [],
        rules: currentVenue.rules || [],
        images: currentVenue.images || [],
        cancellationHours: currentVenue.cancellationHours?.toString() || "24",
        featured: currentVenue.featured || 0,
        phone: currentVenue.phone || "",
        city: currentVenue.city || "",
        courtsCount: currentVenue.courtsCount || 0,
        openTime: currentVenue.openTime || "",
        closeTime: currentVenue.closeTime || "",
      });
    } else {
      // fallback if no venue found
      setForm({
        vendorId: vendorId || "",
        title: "",
        address: "",
        description: "",
        sports: [
          {
            name: "",
            slotPrice: "",
            discountedPrice: "",
            weekendPrice: "",
            timeSlots: [{ open: "", close: "" }],
            courts: [],
          },
        ],
        amenities: [],
        rules: [],
        images: [],
        cancellationHours: "24",
        featured: 0,
        phone: "",
        city: "",
        courtsCount: 0,
        openTime: "",
        closeTime: "",
      });
    }
  }, [currentVenue, vendorId]);

  const [modal, setModal] = useState({ type: "", sportIndex: null });

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAmenities());
      dispatch(fetchRules());
      dispatch(fetchVendors());
      // Ensure vendorId is available, fallback to currentVenue.vendorId or route.params
      const effectiveVendorId = vendorId || currentVenue?.vendorId || route.params?.vendorId;
      if (effectiveVendorId) {
        dispatch(fetchVenues(effectiveVendorId));
      }
    }, [dispatch, vendorId])
  );

  // Debug: log venues and params
//   console.log('venues:', venues);
//   console.log('vendorId:', vendorId, 'turfId:', turfId);
 console.log('currentVenue:', currentVenue);

  const updateSportField = (sportIdx, key, value) => {
    setForm((prev) => {
      const sp = prev.sports.map((s, i) =>
        i === sportIdx ? { ...s, [key]: value } : s
      );
      return { ...prev, sports: sp };
    });
  };
  const addSport = () => {
    setForm((prev) => ({
      ...prev,
      sports: [
        ...prev.sports,
        {
          name: "",
          slotPrice: "",
          discountedPrice: "",
          weekendPrice: "",
          timeSlots: [{ open: "", close: "" }],
          courts: [],
        },
      ],
    }));
  };
  const removeSport = (index) => {
    setForm((prev) => ({
      ...prev,
      sports: prev.sports.filter((_, i) => i !== index),
    }));
  };
  const addTimeSlot = (sportIdx) => {
    setForm((prev) => {
      const sp = prev.sports.map((s, i) =>
        i === sportIdx
          ? { ...s, timeSlots: [...s.timeSlots, { open: "", close: "" }] }
          : s
      );
      return { ...prev, sports: sp };
    });
  };
  const updateTimeSlot = (sportIdx, slotIdx, key, value) => {
    setForm((prev) => {
      const sp = prev.sports.map((s, i) => {
        if (i !== sportIdx) return s;
        const ts = s.timeSlots.map((t, j) =>
          j === slotIdx ? { ...t, [key]: value } : t
        );
        return { ...s, timeSlots: ts };
      });
      return { ...prev, sports: sp };
    });
  };
  const toggleSelection = (key, value, sportIdx = null) => {
    setForm((prev) => {
      if (key === "amenities" || key === "rules") {
        const list = prev[key] || [];
        const updated = list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value];
        return { ...prev, [key]: updated };
      } else if (key === "courts" && typeof sportIdx === "number") {
        const sp = prev.sports.map((s, i) => {
          if (i !== sportIdx) return s;
          const updated = s.courts.includes(value)
            ? s.courts.filter((v) => v !== value)
            : [...s.courts, value];
          return { ...s, courts: updated };
        });
        return { ...prev, sports: sp };
      }
      return prev;
    });
  };
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alert("Permission required to access photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uris] }));
    }
  };
  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!form.vendorId) errors.vendorId = "Vendor is required";
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.address.trim()) errors.address = "Address is required";
    if (!form.cancellationHours || isNaN(Number(form.cancellationHours)))
      errors.cancellationHours = "Valid cancellation hours required";
    if (!form.sports.length) {
      errors.sports = "At least one sport is required";
    } else {
      form.sports.forEach((sport, idx) => {
        if (!sport.name) errors[`sport_${idx}_name`] = "Sport name required";
        if (!sport.slotPrice || isNaN(Number(sport.slotPrice)))
          errors[`sport_${idx}_slotPrice`] = "Valid slot price required";
        if (!sport.discountedPrice || isNaN(Number(sport.discountedPrice)))
          errors[`sport_${idx}_discountedPrice`] = "Valid discounted price required";
        if (!sport.weekendPrice || isNaN(Number(sport.weekendPrice)))
          errors[`sport_${idx}_weekendPrice`] = "Valid weekend price required";
        sport.timeSlots.forEach((slot, tIdx) => {
          if (!slot.open || !slot.close) {
            errors[`sport_${idx}_timeSlot_${tIdx}`] = "Open and close times are required";
          }
        });
      });
    }
    return errors;
  };

  const handleSubmit = () => {
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors in the form.");
      return;
    }
    const payload = {
      title: form.title,
      address: form.address,
      description: form.description,
      sports: form.sports.map((s) => ({
        name: s.name,
        slotPrice: Number(s.slotPrice) || 0,
        discountedPrice: Number(s.discountedPrice) || 0,
        weekendPrice: Number(s.weekendPrice) || 0,
        timeSlots: s.timeSlots.map((t) => ({ open: t.open, close: t.close })),
        courts: s.courts,
      })),
      amenities: form.amenities,
      rules: form.rules,
      images: form.images,
      cancellationHours: Number(form.cancellationHours) || 0,
      featured: Number(form.featured) || 0,
    };
    try {
      dispatch(editVenue({ vendorId, turfId, venueData: payload }));
      Toast.show({
        type: "success",
        text1: "Turf updated successfully!",
      });
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* VENUE INFO */}
      <Surface style={styles.card}>
        <Text style={styles.cardTitle}>Turf Info</Text>
        <CustomPicker
          selectedValue={form.vendorId}
          onValueChange={(v) => setForm((p) => ({ ...p, vendorId: v }))}
          items={(vendorList || []).map((it) => ({ id: it.id, name: it.name }))}
          placeholder="Select Vendor"
        />
        {formErrors.vendorId && (
          <Text style={{ color: "red", marginBottom: 6 }}>{formErrors.vendorId}</Text>
        )}
        <TextInput
          label="Title *"
          mode="outlined"
          value={form.title}
          onChangeText={(t) => setForm((p) => ({ ...p, title: t }))}
          style={styles.input}
        />
        {formErrors.title && (
          <Text style={{ color: "red", marginBottom: 6 }}>{formErrors.title}</Text>
        )}
        <TextInput
          label="Address *"
          mode="outlined"
          value={form.address}
          onChangeText={(t) => setForm((p) => ({ ...p, address: t }))}
          style={styles.input}
        />
        {formErrors.address && (
          <Text style={{ color: "red", marginBottom: 6 }}>{formErrors.address}</Text>
        )}
        <TextInput
          label="Description"
          mode="outlined"
          value={form.description}
          onChangeText={(t) => setForm((p) => ({ ...p, description: t }))}
          multiline
          numberOfLines={3}
          style={styles.input}
        />
      </Surface>

      {/* SPORTS */}
      {form.sports.map((sport, si) => (
        <Surface key={si} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sport #{si + 1}</Text>
            <Text style={styles.smallMuted}>{sport.name || "Select a sport"}</Text>
            {si > 0 && (
              <IconButton
                icon="close-circle"
                iconColor="red"
                size={22}
                onPress={() => removeSport(si)}
              />
            )}
          </View>
          <CustomPicker
            selectedValue={sport.name}
            onValueChange={(v) => updateSportField(si, "name", v)}
            items={sportsOptions}
            placeholder="Select Sport"
          />
          {formErrors[`sport_${si}_name`] && (
            <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_name`]}</Text>
          )}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput
                label="Slot Price"
                mode="outlined"
                keyboardType="numeric"
                value={sport.slotPrice}
                onChangeText={(t) => updateSportField(si, "slotPrice", t)}
                style={styles.halfInput}
              />
              {formErrors[`sport_${si}_slotPrice`] && (
                <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_slotPrice`]}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginRight: 10 }}>
              <TextInput
                label="Discounted Price"
                mode="outlined"
                keyboardType="numeric"
                value={sport.discountedPrice}
                onChangeText={(t) => updateSportField(si, "discountedPrice", t)}
                style={styles.halfInput}
              />
              {formErrors[`sport_${si}_discountedPrice`] && (
                <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_discountedPrice`]}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Weekend Price"
                mode="outlined"
                keyboardType="numeric"
                value={sport.weekendPrice}
                onChangeText={(t) => updateSportField(si, "weekendPrice", t)}
                style={styles.halfInput}
              />
              {formErrors[`sport_${si}_weekendPrice`] && (
                <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_weekendPrice`]}</Text>
              )}
            </View>
          </View>
          <Text style={styles.subLabel}>Time slots</Text>
          {sport.timeSlots.map((slot, ti) => (
            <View key={ti}>
              <CustomPicker
                selectedValue={slot.open}
                onValueChange={(v) => updateTimeSlot(si, ti, "open", v)}
                items={times}
                placeholder="Open"
              />
              {formErrors[`sport_${si}_timeSlot_${ti}`] && (
                <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_timeSlot_${ti}`]}</Text>
              )}
              <CustomPicker
                selectedValue={slot.close}
                onValueChange={(v) => updateTimeSlot(si, ti, "close", v)}
                items={times}
                placeholder="Close"
              />
              {formErrors[`sport_${si}_timeSlot_${ti}`] && (
                <Text style={{ color: "red", marginBottom: 6 }}>{formErrors[`sport_${si}_timeSlot_${ti}`]}</Text>
              )}
            </View>
          ))}
          <Button onPress={() => addTimeSlot(si)} compact style={styles.smallBtn}>
            + Add time slot
          </Button>
          <View style={{ marginTop: 12 }}>
            <Button mode="outlined" onPress={() => setModal({ type: "courts", sportIndex: si })}>
              Select Courts
            </Button>
            <View style={styles.selectedWrap}>
              {sport.courts.length ? (
                sport.courts.map((c) => (
                  <Chip key={c} style={styles.chip} compact>{c}</Chip>
                ))
              ) : (
                <Text style={styles.smallMuted}>No courts selected</Text>
              )}
            </View>
          </View>
        </Surface>
      ))}
      <Button mode="outlined" onPress={addSport} style={styles.addSportBtn}>
        + Add Sport
      </Button>

      {/* IMAGES */}
      <Surface style={styles.card}>
        <Text style={styles.cardTitle}>Images</Text>
        <Text style={styles.smallMuted}>Add venue images (gallery)</Text>
        <View style={{ flexDirection: "row", marginTop: 12, alignItems: "center" }}>
          <Button mode="outlined" onPress={pickImage} icon="camera">
            Pick images
          </Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {form.images.map((uri, i) => (
            <Surface key={i} style={styles.imageSurface}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <IconButton
                icon="close-circle"
                size={20}
                onPress={() => removeImage(i)}
                style={styles.removeIcon}
              />
            </Surface>
          ))}
        </ScrollView>
      </Surface>

      {/* AMENITIES + RULES */}
      <Surface style={styles.card}>
        <Text style={styles.cardTitle}>Extras</Text>
        <Button onPress={() => setModal({ type: "amenities" })} mode="outlined">
          Select Amenities
        </Button>
        <View style={styles.selectedWrap}>
          {form.amenities.length ? (
            form.amenities.map((id) => {
              const a = aminitiesList.find((x) => x.id === id);
              return <Chip key={id} style={styles.chip} compact>{a?.name || id}</Chip>;
            })
          ) : (
            <Text style={styles.smallMuted}>No amenities selected</Text>
          )}
        </View>
        <Button onPress={() => setModal({ type: "rules" })} mode="outlined" style={{ marginTop: 12 }}>
          Select Rules
        </Button>
        <View style={styles.selectedWrap}>
          {form.rules.length ? (
            form.rules.map((id) => {
              const r = rulesList.find((x) => x.id === id);
              return <Chip key={id} style={[styles.chip, styles.ruleChip]} compact>{r?.name || id}</Chip>;
            })
          ) : (
            <Text style={styles.smallMuted}>No rules selected</Text>
          )}
        </View>
        <TextInput
          label="Cancellation Hours"
          mode="outlined"
          keyboardType="numeric"
          value={form.cancellationHours}
          onChangeText={(t) => setForm((p) => ({ ...p, cancellationHours: t }))}
          style={[styles.input, { marginTop: 12 }]}
        />
        <View style={[styles.row, { justifyContent: "space-between", marginTop: 8 }]}>
          <Text style={{ alignSelf: "center" }}>Featured</Text>
          <Switch
            value={!!form.featured}
            onValueChange={(v) => setForm((p) => ({ ...p, featured: v ? 1 : 0 }))}
          />
        </View>
      </Surface>

      <Button mode="contained" onPress={handleSubmit} style={styles.submitBtn}>
        Update
      </Button>

      {/* ===== MODALS ===== */}
      {/* Courts Modal */}
      <Modal visible={modal.type === "courts"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Courts</Text>
            {courtOptions.map((c) => (
              <View key={c} style={styles.checkboxRow}>
                <Checkbox
                  status={form.sports[modal.sportIndex]?.courts.includes(c) ? "checked" : "unchecked"}
                  onPress={() => toggleSelection("courts", c, modal.sportIndex)}
                />
                <Text style={styles.checkboxLabel}>{c}</Text>
              </View>
            ))}
            <Button onPress={() => setModal({ type: "", sportIndex: null })}>Done</Button>
          </Surface>
        </View>
      </Modal>
      {/* Amenities Modal (chips pattern) */}
      <Modal visible={modal.type === "amenities"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Amenities</Text>
            <View style={styles.chipsWrap}>
              {aminitiesList.map((a) => {
                const selected = form.amenities.includes(a.id);
                return (
                  <Chip
                    key={a.id}
                    mode={selected ? "flat" : "outlined"}
                    selected={selected}
                    onPress={() => toggleSelection("amenities", a.id)}
                    style={[styles.selectChip, selected && styles.selectChipSelected]}
                  >
                    {a.name}
                  </Chip>
                );
              })}
            </View>
            <Button onPress={() => setModal({ type: "" })}>Done</Button>
          </Surface>
        </View>
      </Modal>
      {/* Rules Modal (checkbox list inside card) */}
      <Modal visible={modal.type === "rules"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Rules</Text>
            {rulesList.map((r) => (
              <View key={r.id} style={styles.ruleRow}>
                <Checkbox
                  status={form.rules.includes(r.id) ? "checked" : "unchecked"}
                  onPress={() => toggleSelection("rules", r.id)}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{r.name}</Text>
                  <Text style={styles.smallMuted}>{r.description}</Text>
                </View>
              </View>
            ))}
            <Button onPress={() => setModal({ type: "" })}>Done</Button>
          </Surface>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // ...same styles as AddVenueScreen...
  container: { padding: 16, backgroundColor: "#f3f4f6", paddingBottom: 40 },
  card: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  smallMuted: { color: "#6b7280", fontSize: 12 },
  input: { marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  subLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    width: "100%",
    height: 56,
  },
  addSportBtn: { marginBottom: 12 },
  smallBtn: { alignSelf: "flex-start", marginTop: 6 },
  imageScroll: { marginTop: 12, marginBottom: 6 },
  imageSurface: {
    width: 96,
    height: 96,
    borderRadius: 8,
    marginRight: 12,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  imageThumb: { width: 96, height: 96, resizeMode: "cover" },
  removeIcon: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: "transparent",
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  chip: { marginRight: 8, marginBottom: 8 },
  ruleChip: { backgroundColor: "#fff3cd", borderColor: "#f0c36d" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCard: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 6,
  },
  modalTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checkboxLabel: { marginLeft: 6, fontSize: 15 },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  selectChip: { marginRight: 8, marginBottom: 8 },
  selectChipSelected: { backgroundColor: "#0ea5a4", color: "#fff" },
  ruleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  submitBtn: { marginTop: 8, marginBottom: 24 },
});

export default EditVenueScreen;
