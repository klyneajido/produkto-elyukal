import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import auth from "@react-native-firebase/auth";

const AuthScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSignUp = async () => {
    try {
      // Firebase Signup
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const idToken = await userCredential.user.getIdToken();

      setToken(idToken);
      console.log("Firebase ID Token:", idToken);

      // Send token to backend
      await registerUser(idToken);
    } catch (error) {
      console.error("Signup Error:", error.message);
    }
  };

  const registerUser = async (idToken) => {
    try {
      const response = await fetch("http://10.0.2.2:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: idToken,
          name: "Juan Dela Cruz",
        }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);
    } catch (error) {
      console.error("Backend Error:", error);
    }
  };

  return (
    <View>
      <Text>Sign Up</Text>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} />
      <Button title="Sign Up" onPress={handleSignUp} />
      {token ? <Text>Token: {token.substring(0, 20)}...</Text> : null}
    </View>
  );
};

export default AuthScreen;
