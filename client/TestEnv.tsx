import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { SUPABASE_URL, SUPABASE_KEY } from "@env";

const TestEnv = () => {
  useEffect(() => {
    console.log("Supabase URL:", SUPABASE_URL);
    console.log("Supabase Key:", SUPABASE_KEY);
  }, []);

  return (
    <View>
      <Text>Supabase URL: {SUPABASE_URL}</Text>
      <Text>Supabase URL: {SUPABASE_KEY}</Text>
    </View>
  );
};

export default TestEnv;
