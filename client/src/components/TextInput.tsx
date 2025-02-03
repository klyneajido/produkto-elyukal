import {
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Image,
    TextInputProps
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {COLORS, FONTS, FONT_SIZE} from '../assets/constants/constant'
  
  type InputTextProps = {
    error?: boolean;
    labelName?: string;
    labelChild?: string;
    value?: string;
    placeholder?: string;
    onSubmitEditing?: () => void;
    onChangeText?: (text: string) => void;
    keyboardType?: TextInputProps['keyboardType'];
    secureTextEntry?: boolean;
    multiline?: boolean;
    returnKeyType?: TextInputProps['returnKeyType'];
    autoFocus?: boolean;
    placeholderTextColor?: string;
    onBlur?: () => void;
    errorText?: string;
    inputref?: React.RefObject<TextInput>;
    inlineImageLeft?: string;
    autoCorrect?: boolean;
    style?: TextInputProps['style'];
    onFocus?: () => void;
    editable?: boolean;
    maxLength?: number;
    autoCapitalize?: TextInputProps['autoCapitalize'];
    extraStyle?: object;
  };
  
  const InputText: React.FC<InputTextProps> = ({
    error,
    labelName,
    labelChild,
    value,
    placeholder,
    onSubmitEditing,
    onChangeText,
    keyboardType,
    secureTextEntry,
    multiline,
    returnKeyType,
    autoFocus,
    placeholderTextColor,
    onBlur,
    errorText,
    inputref,
    inlineImageLeft,
    autoCorrect,
    style,
    onFocus,
    editable,
    maxLength,
    autoCapitalize,
    extraStyle
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errorBorderColor, setErrorBorderColor] = useState("green");
  
    useEffect(() => {
      setErrorBorderColor(error ? "red" : COLORS.gray);
    }, [error]);
  
    const handleTogglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };
    
    const handleFocus = () => {
      setIsFocused(true);
    };
    
    const handleBlur = () => {
      setIsFocused(false);
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{labelName} <Text style={{ color: 'red' }}>{labelChild}</Text></Text>
        <View style={[styles.inputContainer, { borderColor: errorBorderColor }, extraStyle]}>
          <TextInput
            selectionColor={"green"}
            ref={inputref}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            autoFocus={autoFocus}
            multiline={multiline}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            placeholder={placeholder}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType}
            placeholderTextColor={placeholderTextColor}
            style={[styles.input, style]}
            onBlur={onBlur}
            onFocus={handleFocus}
            inlineImageLeft={inlineImageLeft}
            autoCorrect={autoCorrect}
            editable={editable}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
          />
          {(placeholder?.toLowerCase() === "password" || placeholder?.toLowerCase() === "repassword") && isFocused && (
            <TouchableOpacity style={styles.iconContainer} onPress={handleTogglePasswordVisibility}>
  <FontAwesomeIcon icon={isPasswordVisible ? faEye  : faEyeSlash} size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorText}</Text>
          </View>
        )}
      </View>
    );
  };
  
  export default InputText;
  
  const styles = StyleSheet.create({
    container: {
      alignItems: 'flex-start',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 10,
      paddingRight: 10,
      overflow: 'hidden',
      marginBottom:10,
    },
    input: {
      flex: 1,
      height: 40,
      fontFamily: FONTS.regular,
      includeFontPadding: false,
      color: COLORS.black,
      paddingLeft: 10
    },
    label: {
      fontFamily:FONTS.semibold,
      marginBottom: 10,
      color: COLORS.black,
    },
    iconContainer: {
      padding: 8,
    },
    icon: {
      width: 20,
      height: 20,
    },
    errorContainer: {
      height: 20,
      marginTop: 5,
    },
    errorText: {
      fontSize: 12,
      color: 'red',
      marginTop: 5,
      alignSelf: 'flex-start',
    },
  });
  