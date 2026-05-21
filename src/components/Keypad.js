import React, { Component, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, fonts, normalizeSize } from '../styles/basicStyles';
import RBSheet from "react-native-raw-bottom-sheet";
import { TextInput } from '../components';

const screenWidth = Dimensions.get('window').width;

class Keypad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '0',
      note: ''
    };
  }

  handlePress = (val) => {
    let newValue;
    if (val === 'Limpiar') {
      newValue = '0';
    } else {
      newValue = this.state.value === '0' ? val : this.state.value + val;
    }
    this.setState({ value: newValue }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.value, this.state.note);
      }
    });
  }

  formatCurrency = (val) => {
    let number = parseInt(val, 10);
    if (isNaN(number)) return '$ 0';
    return '$ ' + number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  handleAdd = () => {
    let number = parseInt(this.state.value, 10);
    if (number > 0) {
      if (this.props.onAdd) {
        this.props.onAdd(number, this.state.note);
      }
      this.setState({ value: '0', note: '' }, () => {
        if (this.props.onChange) {
          this.props.onChange('0', '');
        }
      });
      if (this.RBSheet) {
        this.RBSheet.close();
      }
    }
  }

  render() {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Limpiar', '0', '+']
    ];

    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.displayContainer}>
          <Text style={styles.displayText}>
            {this.formatCurrency(this.state.value)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.noteButton}
          activeOpacity={0.7}
          onPress={() => {
            if (this.RBSheet) {
              this.RBSheet.open();
            }
          }}
        >
          <Text style={styles.noteButtonText}>+ Agregar Nota</Text>
        </TouchableOpacity>

        <View style={styles.keypadContainer}>
          {keys.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((key) => {
                const isAddBtn = key === '+';
                const isClearBtn = key === 'Limpiar';
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.key, isAddBtn && styles.keyAdd]}
                    activeOpacity={0.6}
                    onPress={() => isAddBtn ? this.handleAdd() : this.handlePress(key)}
                  >
                    <Text style={[styles.keyText, isAddBtn && styles.keyAddText, isClearBtn && { fontSize: normalizeSize(20) }]}>
                      {key}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <RBSheet
          ref={(ref) => {
            this.RBSheet = ref;
          }}
          minClosingHeight={(50)}
          height={normalizeSize(300)}
          customStyles={{ container: styles.bottomSheetContainer }}
          draggable={true}
          openDuration={250}
          closeDuration={250}
          dragFromTopOnly={true}
        >
          <View style={{ padding: normalizeSize(20) }}>
            <Text style={styles.sheetTitle}>+ Añadir nota</Text>
            <TextInput
              placeholder={'Escribe la nota...'}
              value={this.state.note}
              onChangeText={(text) => this.setState({ note: text }, () => {
                if (this.props.onChange) {
                  this.props.onChange(this.state.value, this.state.note);
                }
              })}
              style={{ marginTop: normalizeSize(20) }}
            />
            <TouchableOpacity
              style={styles.sheetBtn}
              onPress={() => {
                this.RBSheet.close();
                if (parseFloat(this.state.value) > 0) {
                  this.handleAdd();
                }
              }}
            >
              <Text style={styles.sheetBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </View>
    );
  }
}

const KEYPAD_MAX_WIDTH = 480;
const isTablet = screenWidth >= 600;

// Font sizes que se ven bien en tanto tablet como phone.
const KEY_FONT = normalizeSize(isTablet ? 26 : 32);
const ADD_FONT = normalizeSize(isTablet ? 30 : 36);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: normalizeSize(80),
    alignItems: 'stretch',
  },
  displayContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingVertical: normalizeSize(10),
    paddingHorizontal: normalizeSize(30),
    minHeight: normalizeSize(110),
    width: '100%',
    maxWidth: KEYPAD_MAX_WIDTH,
    alignSelf: 'center',
  },
  displayText: {
    fontSize: normalizeSize(isTablet ? 48 : 60),
    fontFamily: fonts.semiBold,
    color: '#000',
  },
  noteButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: KEYPAD_MAX_WIDTH,
    marginHorizontal: normalizeSize(20),
    paddingVertical: normalizeSize(10),
    backgroundColor: '#F5F5F5',
    borderRadius: normalizeSize(10),
    alignItems: 'center',
    marginBottom: normalizeSize(10),
  },
  noteButtonText: {
    fontSize: normalizeSize(16),
    fontFamily: fonts.medium,
    color: colors.text,
  },
  keypadContainer: {
    // flex: 1 hace que las 4 filas siempre llenen el espacio disponible.
    flex: 1,
    maxWidth: KEYPAD_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  key: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  // includeFontPadding: false + lineHeight: corrige el corte de dígitos en
  // Android (el padding fantasma de Material truncaba el bottom de los nums).
  keyText: {
    fontSize: KEY_FONT,
    lineHeight: KEY_FONT * 1.2,
    fontFamily: fonts.medium,
    color: '#333',
    textAlign: 'center',
    includeFontPadding: false,
  },
  keyAdd: {
    backgroundColor: colors.buttonBackground,
  },
  keyAddText: {
    color: 'white',
    fontSize: ADD_FONT,
    lineHeight: ADD_FONT * 1.2,
    includeFontPadding: false,
  },
  bottomSheetContainer: {
    borderTopLeftRadius: normalizeSize(15),
    borderTopRightRadius: normalizeSize(15),
  },
  sheetTitle: {
    fontSize: normalizeSize(18),
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'center'
  },
  sheetBtn: {
    backgroundColor: colors.buttonBackground,
    padding: normalizeSize(15),
    borderRadius: normalizeSize(8),
    marginTop: normalizeSize(30),
    alignItems: 'center'
  },
  sheetBtnText: {
    color: 'white',
    fontFamily: fonts.bold,
    fontSize: normalizeSize(16),
    textAlign: 'center'
  }
});

export default Keypad;
