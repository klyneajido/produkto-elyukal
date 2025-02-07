import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import styles from '../assets/style/homeStyle.js';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'; // Correct FontAwesome import
import { faCalendar, faMapMarkedAlt, faStar, faTicketAlt, faSliders } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contextAuth.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProductList from '../components/ProductList.tsx';

interface User {
  email: string,
  first_name: string,
  last_name: string,
  profile: string,
}
const Home: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const { user } = useAuth();
  console.log("Home component auth context:", user);
  // const [storedData, setStoredData] = useState<string |null>(null);
  const [text, onChangeText] = useState<string>('');

  // useEffect(()=>{
  //   const getData= async () =>{
  //     try{
  //       const value = await AsyncStorage.getItem('token')
  //       if(value !== null){
  //         setStoredData(value);
  //         console.log("DATA: ",value);
  //       }
  //     }
  //     catch (e){
  //       console.log("Error Failed to fetch value data")
  //     }
  //   };
  //   getData();

  // },[]);


  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Redirect to login if no token
        navigation.navigate("Login");
      }
    };
    checkAuth();
  }, []);

  //Discover scroll component
  const [activeIndex, setActiveIndex] = useState(0);
  const items = ["Discover", "Rosario", "Sto. Tomas", "Agoo", "Aringay", "Caba", "Bauang", "San Fernando City", "San Juan", "Bacnotan", "Santol", "San Gabriel", "Bangar", "Sudipen"];

  // random events (mock up)
  const events = [
    {
      id: 1,
      name: 'Craft Fair Extravaganza',
      description: 'Annual showcase of local artisan crafts and handmade goods',
      location: 'Bacnotan Town Center',
      date: 'May 15, 2024',
      time: '10:00 AM - 6:00 PM',
      price: 'Free Entry',
      image: require('../assets/img/events/craft-fair.jpg'),
      category: 'Handcraft'
    },
    {
      id: 2,
      name: 'Culinary Arts Festival',
      description: 'Celebrating local cuisine with cooking demos and tastings',
      location: 'San Fernando Plaza',
      date: 'June 20, 2024',
      time: '12:00 PM - 9:00 PM',
      price: 'Php 250',
      image: require('../assets/img/events/culinary-arts.png'),
      category: 'Food'
    },
    {
      id: 3,
      name: 'Pottery Master Class',
      description: 'Hands-on workshop with renowned local ceramic artists',
      location: 'Aringay Community Hall',
      date: 'July 5, 2024',
      time: '2:00 PM - 5:00 PM',
      price: 'Php 500',
      image: require('../assets/img/events/pottery.jpg'),
      category: 'Pottery'
    }
  ];
  // const { email, first_name, last_name } = user?.profile;
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <View style={styles.topContainer}>
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                onChangeText={onChangeText}
                value={text}
                placeholder="Enter Text..."
                placeholderTextColor="#CCCCCC"
              />
              <TouchableOpacity style={styles.filterButton}>
                <FontAwesomeIcon icon={faSliders} size={20} color="#CCCCCC" />
              </TouchableOpacity>
            </View>
            {/* <View>
              <Text>Welcome, {first_name} {last_name}</Text>
              <Text>Email: {email}</Text>
            </View> */}

            {/* Horizontal Circles */}
            <ScrollView showsHorizontalScrollIndicator={false} horizontal style={styles.circleContainer}>
              <View style={styles.circleWrapper}>
                <TouchableOpacity style={styles.circleSubContainer}>
                  <Image style={styles.image} source={require('../assets/img/handcraft.png')} />
                  <Text style={styles.text}>Handcraft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleSubContainer}>
                  <Image style={styles.image} source={require('../assets/img/furniture.jpg')} />
                  <Text style={styles.text}>Furniture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleSubContainer}>
                  <Image style={styles.image} source={require('../assets/img/food.jpg')} />
                  <Text style={styles.text}>Food</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.circleSubContainer}>
                  <Image style={styles.image} source={require('../assets/img/pottery.jpg')} />
                  <Text style={styles.text}>Pottery</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Featured Section */}
          <View style={styles.featuredContainer}>
            <View style={styles.square1}>
              <Image style={styles.featureImage} source={require('../assets/img/final.jpg')} />
            </View>
            <View style={styles.squaresContainer}>
              <View style={styles.squares}>
                <View style={styles.square2}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature2.png')} />
                </View>
              </View>
              <View style={styles.squares}>
                <View style={styles.square3}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature3.png')} />
                </View>
                <View style={styles.square3}>
                  <Image style={styles.featureImage} source={require('../assets/img/feature4.png')} />
                </View>
              </View>
            </View>
          </View>

          {/* Discover Section */}
          <View style={styles.divider}></View>
          <ScrollView showsHorizontalScrollIndicator={false} horizontal style={styles.discoverContainer}>
            <View style={styles.discoverWrapper}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActiveIndex(index)}
                  style={[styles.discoverText, activeIndex === index && styles.activeDiscoverText]}
                >
                  <Text style={styles.discoverText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>



          {/* Products Section */}
          <View style={styles.productContainer}>
           
              <ProductList />
         
          </View>

          {/* Events Section */}
          <View style={styles.eventsContainer}>
            <View style={styles.divider}></View>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {events.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCardLarge}>
                  <Image source={event.image} style={styles.eventImageLarge} />
                  <View style={styles.eventOverlay}>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                  </View>
                  <View style={styles.eventDetailsLarge}>
                    <Text style={styles.eventNameLarge}>{event.name}</Text>
                    <Text style={styles.eventDescriptionLarge}>{event.description}</Text>

                    <View style={styles.eventInfoRowLarge}>
                      <View style={styles.eventInfoItemLarge}>
                        <FontAwesomeIcon icon={faCalendar} size={14} color="#ffd700" />
                        <Text style={styles.eventInfoTextLarge}>{event.date}</Text>
                      </View>
                      <View style={styles.eventInfoItemLarge}>
                        <FontAwesomeIcon icon={faMapMarkedAlt} size={14} color="#ffd700" />
                        <Text style={styles.eventInfoTextLarge}>{event.location}</Text>
                      </View>
                    </View>
                    <View style={styles.eventBottomRowLarge}>
                      <TouchableOpacity style={styles.eventButtonLarge}>
                        <Text style={styles.eventButtonTextLarge}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
