import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {TextInput} from 'react-native-gesture-handler';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import AwesomeAlert from 'react-native-awesome-alerts';
import Items from './Items'
import Toast from 'react-native-toast-message';
import Loader from '../components/Loader';

const Add = ({navigation}) => {
  const [foodImage, setFoodImage] = useState('');
  const [foodName, setFoodName] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [description, setDescription] = useState('');
  const [modalVisible,setModalVisible]= useState(false)

  const handleReset = () => {
    setActualPrice('');
    setDescription('');
    setFoodImage('');
    setFoodName('');
    setDiscountPrice('');
  };

  const handleUpload = async () => {
    const timestamp = new Date().getTime();
    const uri = foodImage.uri;
    // console.log('EEEEEE', uri);
    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    const task = storage().ref(`${timestamp}_${filename}`).putFile(uploadUri); // ref me imagename kis name se save hogi and putfile me url jaaega

    try {
      await task;
      const url = await storage()
        .ref(`${timestamp}_${filename}`)
        .getDownloadURL(); // jis name se save h uska URL download
      return url;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleSubmit = async () => {
    const url = await handleUpload();
    setModalVisible(true)
    firestore()
      .collection('fooditem')
      .add({
        name: foodName,
        price: actualPrice,
        discountprice: discountPrice,
        description: description,
        imageLink: url,
        quantity:1
      })
      .then(() => {
        setModalVisible(false)
        // console.log('User added!');
        Toast.show({
          type:'success',
          text1:'Submitted',
          text2:'Food Item Submitted Successfully',
          visibilityTime:2500,
          position:'bottom'
        })
        handleReset();
        navigation.navigate('Items')
      });
  };

  const selectImage = () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      includeBase64: true,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      } else if (response.error) {
        console.log(response.error);
        return;
      }
      // console.log('Imageee', response.assets[0]);
      setFoodImage(response.assets[0]);
    });
  };
  // console.log('FFFFFFF', foodImage);

  return (
      <ScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Add Item</Text>
        </View>
        {foodImage ? (
          <Image
            style={{
              height: 180,
              width: 200,
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 10,
            }}
            source={{uri: `data:${foodImage.type};base64,${foodImage.base64}`}}
            placeholder="Upload Image"
          />
        ) : (
          <View></View>
        )}

        <TextInput
          placeholder="Enter Item Name"
          style={styles.inputStyle}
          value={foodName}
          onChangeText={text => setFoodName(text)}
        />
        <TextInput
          placeholder="Enter Item Price"
          style={styles.inputStyle}
          value={actualPrice}
          onChangeText={text => setActualPrice(text)}
        />
        <TextInput
          placeholder="Enter Item Discounted Price"
          style={styles.inputStyle}
          value={discountPrice}
          onChangeText={text => setDiscountPrice(text)}
        />
        <TextInput
          placeholder="Enter Item Description"
          style={styles.inputStyle}
          value={description}
          onChangeText={text => setDescription(text)}
        />
        <TouchableOpacity style={styles.pickBtn} onPress={selectImage}>
          <Text style={styles.buttonText1}>Pick Image Fromt Gallary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtn} onPress={handleSubmit}>
          <Text style={styles.buttonText2}>Upload Item</Text>
        </TouchableOpacity>
      <Loader setModalVisible={setModalVisible} modalVisible={modalVisible} />
      </View>
      </ScrollView>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    marginTop: 20,
    // justifyContent:'center',
    flex: 1,
  },
  header: {
    height: 60,
    width: '100%',
    backgroundColor: '#ffff',
    elevation: 5,
    padding: 20,
    paddingTop: 0,
    justifyContent: 'flex-end',
  },
  headerText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 20,
  },
  inputStyle: {
    width: '90%',
    height: 50,
    borderRadius: 10,
    borderWidth: 0.5,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 30,
    alignSelf: 'center',
    fontWeight: '500',
  },
  pickBtn: {
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadBtn: {
    backgroundColor: '#27ae60',
    width: '90%',
    height: 50,
    borderWidth: 0.5,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  buttonText1: {
    fontWeight: '500',
  },
  buttonText2: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
