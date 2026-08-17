// screens/AccountScreen.js

import React, {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import * as Animatable from 'react-native-animatable';

import {
  useAuth,
} from '../context/AuthContext';



/* =================================================
    CONSTANTS
================================================= */


const PRIMARY_COLOR = '#FF6B00';

const BACKGROUND_COLOR = '#F8F9FB';

const CARD_COLOR = '#FFFFFF';




/* =================================================
    ACCOUNT SCREEN
================================================= */


export default function AccountScreen(){


  const navigation =
    useNavigation();



  const {
    userInfo,
    logout,
    authLoading,
    refreshUserInfo,
    isAdmin,
  } =
    useAuth();




  /* ===============================================
      STATES
  =============================================== */


  const [
    refreshing,
    setRefreshing
  ] =
  useState(false);



  const [
    loadingButton,
    setLoadingButton
  ] =
  useState(null);



  const [
    logoutLoading,
    setLogoutLoading
  ] =
  useState(false);



  const containerRef =
    useRef(null);





  /* ===============================================
      HEADER CONFIGURATION
  =============================================== */


  useLayoutEffect(()=>{


    navigation.setOptions({


      headerShown:false,


    });


  },[
    navigation
  ]);







  /* ===============================================
      SCREEN REFRESH
  =============================================== */


  const handleRefresh =
    async()=>{


      try{


        setRefreshing(true);



        if(
          containerRef.current
        ){

          containerRef.current.fadeIn(
            500
          );

        }



        await refreshUserInfo?.();



      }
      catch(error){


        console.log(
          "Refresh user error:",
          error
        );


      }
      finally{


        setRefreshing(false);


      }


    };









  /* ===============================================
      LOGOUT HANDLER
  =============================================== */


  const handleLogout =
    ()=>{


      Alert.alert(

        "Logout",

        "Are you sure you want to logout?",


        [


          {

            text:"Cancel",

            style:"cancel",

          },


          {


            text:"Logout",


            style:"destructive",


            onPress:async()=>{


              try{


                setLogoutLoading(true);


                await logout();


              }
              catch(error){


                Alert.alert(

                  "Error",

                  "Unable to logout"

                );


              }
              finally{


                setLogoutLoading(false);


              }


            }


          }


        ]

      );


    };








  /* ===============================================
      MENU ITEM COMPONENT
  =============================================== */


  const AccountMenuItem =
  ({
    id,
    icon,
    title,
    subtitle,
    color,
    screen,
    delay,
  })=>{


    return(


      <Animatable.View


        animation="fadeInUp"


        delay={delay}


        duration={700}


        useNativeDriver



      >



        <View

          style={
            styles.menuCard
          }

        >




          <View

            style={

              [
                styles.menuIconBox,

                {
                  backgroundColor:
                  `${color}18`
                }

              ]

            }

          >


            <Ionicons

              name={icon}

              size={25}

              color={color}

            />


          </View>







          <View

            style={
              styles.menuContent
            }

          >


            <Text

              style={
                styles.menuTitle
              }

            >

              {title}


            </Text>



            <Text

              style={
                styles.menuSubtitle
              }

            >

              {subtitle}


            </Text>


          </View>







          <TouchableOpacity


            activeOpacity={0.85}


            style={
              styles.viewButton
            }



            disabled={
              loadingButton===id
            }



            onPress={async()=>{


              try{


                setLoadingButton(id);


                navigation.navigate(
                  screen
                );


              }

              finally{


                setLoadingButton(null);


              }


            }}



          >



            {
              loadingButton===id

              ?

              (

                <ActivityIndicator

                  size="small"

                  color="#FFFFFF"

                />

              )

              :

              (

                <Ionicons

                  name="chevron-forward"

                  size={20}

                  color="#FFFFFF"

                />

              )

            }



          </TouchableOpacity>





        </View>



      </Animatable.View>


    );


  };
    /* ===============================================
      LOADING STATE
  =============================================== */


  if(authLoading){


    return(


      <SafeAreaView
        style={styles.safeArea}
      >

        <View
          style={styles.center}
        >

          <ActivityIndicator

            size="large"

            color={PRIMARY_COLOR}

          />


          <Text

            style={styles.loadingText}

          >

            Loading account...


          </Text>


        </View>


      </SafeAreaView>


    );


  }





  /* ===============================================
      USER NOT FOUND
  =============================================== */


  if(!userInfo){


    return(


      <SafeAreaView

        style={styles.safeArea}

      >


        <View

          style={styles.center}

        >


          <Ionicons

            name="person-circle-outline"

            size={90}

            color="#D0D5DD"

          />


          <Text

            style={styles.errorTitle}

          >

            User not logged in


          </Text>



          <TouchableOpacity

            style={styles.loginButton}

            onPress={()=>
              navigation.navigate(
                "Login"
              )
            }

          >


            <Text

              style={styles.loginText}

            >

              Login


            </Text>


          </TouchableOpacity>


        </View>


      </SafeAreaView>


    );


  }








  /* ===============================================
      MAIN UI
  =============================================== */


  return(


    <SafeAreaView

      style={styles.safeArea}

    >


      <StatusBar

        barStyle="dark-content"

        backgroundColor={BACKGROUND_COLOR}

      />



      <ScrollView


        showsVerticalScrollIndicator={false}


        contentContainerStyle={
          styles.container
        }



        refreshControl={


          <RefreshControl


            refreshing={
              refreshing
            }


            onRefresh={
              handleRefresh
            }


            colors={[
              PRIMARY_COLOR
            ]}


          />


        }


      >




        <Animatable.View


          ref={containerRef}


          animation="fadeIn"


          duration={600}



        >






          {/* ============================
              PROFILE HEADER
          ============================ */}



          <View

            style={styles.profileCard}

          >




            <View

              style={styles.avatarContainer}

            >


              <Ionicons

                name="person"

                size={45}

                color="#FFFFFF"

              />


            </View>






            <View

              style={styles.profileInfo}

            >


              <Text

                style={styles.profileName}

              >

                {userInfo.firstName}

                {" "}

                {userInfo.lastName || ""}


              </Text>




              <Text

                style={styles.profileEmail}

              >

                {userInfo.email}


              </Text>




              <View

                style={styles.memberBadge}

              >


                <Ionicons

                  name="shield-checkmark"

                  size={14}

                  color={PRIMARY_COLOR}

                />


                <Text

                  style={styles.memberText}

                >

                  sdCart Member


                </Text>


              </View>



            </View>




          </View>








          {/* ============================
              ACCOUNT MENU
          ============================ */}



          <Text

            style={styles.sectionTitle}

          >

            My Account


          </Text>







          <AccountMenuItem

            id="account"

            icon="person-outline"

            title="Account Information"

            subtitle="Manage your personal details"

            color="#2563EB"

            screen="AccountInfo"

            delay={100}

          />






          <AccountMenuItem

            id="orders"

            icon="cube-outline"

            title="My Orders"

            subtitle="Track your previous purchases"

            color="#9333EA"

            screen="Orders"

            delay={200}

          />







          <AccountMenuItem

            id="wishlist"

            icon="heart-outline"

            title="Wishlist"

            subtitle="Your saved products"

            color="#E11D48"

            screen="Wishlist"

            delay={300}

          />







          <AccountMenuItem

            id="address"

            icon="location-outline"

            title="Delivery Address"

            subtitle="Manage delivery locations"

            color="#16A34A"

            screen="DeliveryAddress"

            delay={400}

          />
          {isAdmin ? (

            <AccountMenuItem

              id="admin"

              icon="shield-checkmark-outline"

              title="Admin Dashboard"

              subtitle="Manage products, orders and users"

              color="#7C3AED"

              screen="Admin"

              delay={500}

            />

          ) : null}







          {/* ============================
              LOGOUT
          ============================ */}




          <TouchableOpacity


            activeOpacity={0.9}


            style={styles.logoutButton}


            onPress={handleLogout}


            disabled={logoutLoading}



          >


            {

              logoutLoading

              ?

              (

                <ActivityIndicator

                  color="#FFFFFF"

                />

              )


              :

              (

                <>


                  <Ionicons

                    name="log-out-outline"

                    size={22}

                    color="#FFFFFF"

                  />


                  <Text

                    style={styles.logoutText}

                  >

                    Logout


                  </Text>


                </>


              )

            }


          </TouchableOpacity>








          <Text

            style={styles.footer}

          >

            sdCart • Shopping made simple


          </Text>





        </Animatable.View>



      </ScrollView>



    </SafeAreaView>


  );


}
const styles = StyleSheet.create({


  /* ===============================================
      ROOT
  =============================================== */


  safeArea:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
  },


  container:{
    padding:16,
    paddingBottom:40,
  },



  center:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:BACKGROUND_COLOR,
  },



  /* ===============================================
      LOADING / ERROR
  =============================================== */


  loadingText:{
    marginTop:15,
    fontSize:16,
    color:'#667085',
    fontWeight:'600',
  },



  errorTitle:{
    marginTop:20,
    fontSize:20,
    fontWeight:'800',
    color:'#344054',
  },


  loginButton:{
    marginTop:25,
    backgroundColor:PRIMARY_COLOR,
    paddingHorizontal:40,
    paddingVertical:14,
    borderRadius:30,
  },


  loginText:{
    color:'#FFFFFF',
    fontWeight:'700',
    fontSize:15,
  },





  /* ===============================================
      PROFILE CARD
  =============================================== */


  profileCard:{
    backgroundColor:CARD_COLOR,

    borderRadius:24,

    padding:20,

    flexDirection:'row',

    alignItems:'center',

    marginBottom:25,


    shadowColor:'#000',

    shadowOffset:{
      width:0,
      height:5,
    },

    shadowOpacity:0.08,

    shadowRadius:10,

    elevation:4,
  },



  avatarContainer:{
    height:85,

    width:85,

    borderRadius:42,

    backgroundColor:PRIMARY_COLOR,

    justifyContent:'center',

    alignItems:'center',
  },




  profileInfo:{
    flex:1,

    marginLeft:18,
  },



  profileName:{
    fontSize:22,

    fontWeight:'900',

    color:'#101828',
  },



  profileEmail:{
    marginTop:5,

    fontSize:13,

    color:'#667085',
  },




  memberBadge:{
    marginTop:12,

    flexDirection:'row',

    alignItems:'center',

    backgroundColor:'#FFF4E8',

    alignSelf:'flex-start',

    paddingHorizontal:12,

    paddingVertical:6,

    borderRadius:20,
  },




  memberText:{
    marginLeft:5,

    fontSize:12,

    color:PRIMARY_COLOR,

    fontWeight:'700',
  },







  /* ===============================================
      SECTION
  =============================================== */


  sectionTitle:{
    fontSize:18,

    fontWeight:'800',

    color:'#101828',

    marginBottom:14,
  },







  /* ===============================================
      MENU CARD
  =============================================== */



  menuCard:{
    backgroundColor:'#FFFFFF',

    borderRadius:20,

    padding:15,

    flexDirection:'row',

    alignItems:'center',

    marginBottom:14,


    shadowColor:'#000',

    shadowOffset:{
      width:0,
      height:3,
    },


    shadowOpacity:0.06,


    shadowRadius:8,


    elevation:2,

  },





  menuIconBox:{
    height:50,

    width:50,

    borderRadius:16,

    justifyContent:'center',

    alignItems:'center',
  },






  menuContent:{
    flex:1,

    marginLeft:14,
  },






  menuTitle:{
    fontSize:16,

    fontWeight:'800',

    color:'#101828',
  },





  menuSubtitle:{
    marginTop:4,

    fontSize:12,

    color:'#667085',
  },







  viewButton:{
    height:38,

    width:38,

    borderRadius:19,

    backgroundColor:PRIMARY_COLOR,

    justifyContent:'center',

    alignItems:'center',
  },








  /* ===============================================
      LOGOUT
  =============================================== */


  logoutButton:{
    marginTop:20,

    height:52,

    borderRadius:18,

    backgroundColor:'#DC2626',

    flexDirection:'row',

    alignItems:'center',

    justifyContent:'center',

    gap:10,


    shadowColor:'#DC2626',

    shadowOffset:{
      width:0,
      height:5,
    },

    shadowOpacity:0.2,

    shadowRadius:8,

    elevation:5,
  },




  logoutText:{
    color:'#FFFFFF',

    fontSize:16,

    fontWeight:'800',
  },







  /* ===============================================
      FOOTER
  =============================================== */


  footer:{
    marginTop:30,

    textAlign:'center',

    fontSize:12,

    color:'#98A2B3',

    fontWeight:'600',
  },



});