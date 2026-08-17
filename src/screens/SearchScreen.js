import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Animated,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Keyboard,
  Alert,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getProducts } from '../services/productService';
import { normalizeProductPage } from '../services/normalizers';
import { useCart } from '../context/CartContext';


/* =================================================
   CONSTANTS
================================================= */

const SEARCH_HISTORY_KEY =
  'SEARCH_HISTORY';


const SEARCH_DELAY = 500;


const PAGE_SIZE = 10;



const AnimatedTextInput =
  Animated.createAnimatedComponent(TextInput);



/* =================================================
   SEARCH SCREEN
================================================= */


export default function SearchScreen({
  navigation,
}) {


  /* ===============================
      STATE
  =============================== */


  const [
    searchText,
    setSearchText
  ] = useState('');


  const [
    products,
    setProducts
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(false);



  const [
    refreshing,
    setRefreshing
  ] = useState(false);



  const [
    loadingMore,
    setLoadingMore
  ] = useState(false);



  const [
    page,
    setPage
  ] = useState(0);



  const [
    hasMore,
    setHasMore
  ] = useState(true);



  const [
    addingToCartId,
    setAddingToCartId
  ] = useState(null);



  const [
    searchHistory,
    setSearchHistory
  ] = useState([]);



  const [
    showHistory,
    setShowHistory
  ] = useState(true);



  const [
    error,
    setError
  ] = useState('');



  const { addToCart } = useCart();

  /* ===============================
      REFS
  =============================== */


  const debounceTimer =
    useRef(null);



  const abortController =
    useRef(null);



  /* ===============================
      ANIMATION
  =============================== */


  const searchHeight =
    useRef(
      new Animated.Value(54)
    ).current;



  const shadowAnimation =
    useRef(
      new Animated.Value(2)
    ).current;



  /* ===============================
      SEARCH ANIMATION
  =============================== */


  const animateSearch =
    useCallback(
      focused => {


        Animated.parallel([

          Animated.spring(
            searchHeight,
            {
              toValue:
                focused ? 62 : 54,

              useNativeDriver:false,
            }
          ),


          Animated.spring(
            shadowAnimation,
            {
              toValue:
                focused ? 8 : 2,

              useNativeDriver:false,
            }
          ),

        ]).start();

      },
      []
    );



  /* ===============================
      LOAD SEARCH HISTORY
  =============================== */


  const loadHistory =
    useCallback(
      async()=>{

        try{

          const stored =
            await AsyncStorage.getItem(
              SEARCH_HISTORY_KEY
            );


          if(stored){

            setSearchHistory(
              JSON.parse(stored)
            );

          }


        }catch(error){

          console.log(
            "History Error:",
            error
          );

        }


      },
      []
    );



  useEffect(()=>{

    loadHistory();

  },[]);



  /* ===============================
      SAVE SEARCH HISTORY
  =============================== */


  const saveSearch =
    useCallback(
      async(keyword)=>{


        if(!keyword.trim())
          return;



        setSearchHistory(
          previous=>{


            const updated =
              previous.filter(
                item =>
                  item.toLowerCase()
                  !==
                  keyword.toLowerCase()
              );


            updated.unshift(
              keyword
            );


            const finalHistory =
              updated.slice(0,8);



            AsyncStorage.setItem(
              SEARCH_HISTORY_KEY,
              JSON.stringify(
                finalHistory
              )
            );


            return finalHistory;

          }
        );


      },
      []
    );



  /* ===============================
      SUGGESTIONS
  =============================== */


  const suggestions =
    useMemo(
      ()=>[
        'mobile',
        'Laptop',
        'Shoes',
        'Rice',
        'Milk',
        'Watch',
        'Headphones',
        'Smart TV',
      ],
      []
    );
      /* =================================================
      FETCH PRODUCTS API
  ================================================= */


  const fetchProducts =
    useCallback(
      async(
        keyword,
        pageNumber = 0,
        isRefresh = false
      )=>{


        if(!keyword.trim())
          return;



        try{


          /*
             Cancel previous request
          */

          if(abortController.current){

            abortController.current.abort();

          }



          abortController.current =
            new AbortController();



          if(isRefresh){

            setRefreshing(true);

          }
          else if(pageNumber === 0){

            setLoading(true);

          }
          else{

            setLoadingMore(true);

          }



          setError('');



          const result =
            await getProducts({

              q:keyword,

              page:pageNumber,

              size:PAGE_SIZE,

              signal:
              abortController.current.signal,

            });



          const content =
            normalizeProductPage(result)?.content || [];



          if(pageNumber === 0){


            setProducts(
              content
            );


          }
          else{


            setProducts(
              previous=>[
                ...previous,
                ...content
              ]
            );


          }



          setPage(
            pageNumber
          );



          setHasMore(
            !result.last
          );



        }
        catch(error){


          if(
            error?.code === 'ERR_CANCELED'
          ){

            return;

          }



          console.log(
            "Search API Error:",
            error.message
          );



          setError(
            "Unable to load products"
          );



          if(pageNumber===0){

            setProducts([]);

          }



        }
        finally{


          setLoading(false);

          setRefreshing(false);

          setLoadingMore(false);


        }


      },
      []
    );





  /* =================================================
      AUTO SEARCH WITH DEBOUNCE
  ================================================= */


  useEffect(()=>{


    if(debounceTimer.current){

      clearTimeout(
        debounceTimer.current
      );

    }



    const keyword =
      searchText.trim();



    if(!keyword){


      setProducts([]);

      setShowHistory(true);

      return;


    }



    setShowHistory(false);



    debounceTimer.current =
      setTimeout(()=>{


        fetchProducts(
          keyword,
          0
        );


        saveSearch(
          keyword
        );


      },SEARCH_DELAY);



    return ()=>{


      if(debounceTimer.current){

        clearTimeout(
          debounceTimer.current
        );

      }


    };


  },[
    searchText
  ]);





  /* =================================================
      REFRESH PRODUCTS
  ================================================= */


  const handleRefresh =
    useCallback(()=>{


      if(!searchText.trim())
        return;



      fetchProducts(
        searchText,
        0,
        true
      );


    },[
      searchText
    ]);





  /* =================================================
      LOAD NEXT PAGE
  ================================================= */


  const handleLoadMore =
    useCallback(()=>{


      if(

        loadingMore ||

        loading ||

        !hasMore

      )
      {

        return;

      }



      fetchProducts(

        searchText,

        page + 1

      );


    },[
      loadingMore,
      loading,
      hasMore,
      page,
      searchText
    ]);





  /* =================================================
      ADD TO CART
  ================================================= */


  const handleAddToCart =
    async(product)=>{


      try{


        setAddingToCartId(
          product.id
        );



        const result =
        await addToCart(

          product.id,

          1

        );



        if(!result.success){

          Alert.alert(

            "Error",

            result.message

          );

          return;

        }



        Alert.alert(

          "Success",

          "Product added to cart"

        );


      }
      catch(error){


        Alert.alert(

          "Error",

          "Unable to add product"

        );


      }
      finally{


        setAddingToCartId(
          null
        );


      }


    };
      /* =================================================
      PRODUCT CARD COMPONENT
  ================================================= */


  const ProductCard = memo(
    ({
      item
    })=>{


      const imageOpacity =
        useRef(
          new Animated.Value(0)
        ).current;



      const handleImageLoad =
        ()=>{


          Animated.timing(

            imageOpacity,

            {

              toValue:1,

              duration:300,

              useNativeDriver:true,

            }

          ).start();


        };



      const price =
        Number(
          item.price || 0
        );



      const originalPrice =
        Number(
          item.actualPrice ||
          item.price ||
          0
        );



      const discount =
        originalPrice > price

        ?

        Math.round(

          (
            (
              originalPrice-price
            )
            /
            originalPrice
          )
          *
          100

        )

        :

        0;



      const available =
        item.stock === undefined ||
        item.stock === null ||
        item.stock > 0;

      useEffect(() => {

  return () => {

    // cancel pending debounce timer
    if (debounceTimer.current) {
      clearTimeout(
        debounceTimer.current
      );
    }


    // cancel running API request
    if (abortController.current) {
      abortController.current.abort();
    }

  };

}, []);


      return(


        <TouchableOpacity

          activeOpacity={0.92}

          style={
            styles.productCard
          }

          onPress={()=>


            navigation.navigate(

              "SelectedProduct",

              {
                id:item.id
              }

            )


          }

        >



          {/* IMAGE SECTION */}


          <View
            style={
              styles.imageWrapper
            }
          >


            <Animated.Image

              source={

                item.imageUrl

                ?

                {
                  uri:item.imageUrl
                }

                :

                require(
                  '../../assets/product-placeholder.png'
                )

              }


              style={[
                styles.productImage,

                {
                  opacity:imageOpacity
                }

              ]}


              resizeMode="cover"


              onLoad={
                handleImageLoad
              }


            />



            {
              discount > 0 &&

              <View
                style={
                  styles.discountBadge
                }
              >

                <Text
                  style={
                    styles.discountText
                  }
                >

                  {discount}% OFF

                </Text>

              </View>

            }




            {
              !available &&

              <View
                style={
                  styles.outStockBadge
                }
              >

                <Text
                  style={
                    styles.outStockText
                  }
                >

                  Out Of Stock

                </Text>

              </View>

            }




            <TouchableOpacity

              activeOpacity={0.8}

              style={
                styles.favoriteButton
              }

            >

              <Ionicons

                name="heart-outline"

                size={20}

                color="#475467"

              />


            </TouchableOpacity>


          </View>





          {/* DETAILS SECTION */}



          <View
            style={
              styles.productDetails
            }
          >



            <Text

              numberOfLines={2}

              style={
                styles.productName
              }

            >

              {item.name}


            </Text>




            <View
              style={
                styles.ratingBox
              }
            >


              <Ionicons

                name="star"

                size={14}

                color="#FBBF24"

              />



              <Text

                style={
                  styles.ratingText
                }

              >

                {
                  Number(
                    item.rating || 4.5
                  )
                  .toFixed(1)
                }


              </Text>


            </View>






            <View
              style={
                styles.priceContainer
              }
            >


              <Text
                style={
                  styles.currentPrice
                }
              >

                ₹{price}

              </Text>



              {
                originalPrice > price &&

                <Text

                  style={
                    styles.oldPrice
                  }

                >

                  ₹{originalPrice}

                </Text>

              }



            </View>





            {
              item.brand &&

              <Text

                style={
                  styles.brandText
                }

              >

                {item.brand}

              </Text>

            }





            {
              item.stock !== undefined &&

              <Text

                style={[

                  styles.stockText,

                  {

                    color:

                    available

                    ?

                    "#16A34A"

                    :

                    "#DC2626"

                  }

                ]}


              >

                {

                  available

                  ?

                  `${item.stock} available`

                  :

                  "Unavailable"

                }


              </Text>

            }







            <TouchableOpacity

              activeOpacity={0.85}

              disabled={
                !available ||
                addingToCartId===item.id
              }


              onPress={()=>{

                handleAddToCart(
                  item
                );

              }}


              style={[

                styles.cartButton,

                !available &&
                styles.disabledCartButton

              ]}

            >



              {

                addingToCartId===item.id

                ?

                (

                  <ActivityIndicator

                    color="#FFFFFF"

                    size="small"

                  />

                )

                :

                (

                  <>

                  <Ionicons

                    name="cart-outline"

                    size={18}

                    color="#FFFFFF"

                  />



                  <Text

                    style={
                      styles.cartButtonText
                    }

                  >

                    Add To Cart

                  </Text>


                  </>

                )


              }



            </TouchableOpacity>




          </View>




        </TouchableOpacity>


      );


    }

  );


  ProductCard.displayName =
    "ProductCard";
    /* =================================================
      EMPTY STATE COMPONENT
  ================================================= */


  const EmptyState = memo(()=>{


    if(loading)
      return null;



    return(

      <View
        style={
          styles.emptyContainer
        }
      >


        <Ionicons

          name="search-outline"

          size={75}

          color="#D0D5DD"

        />



        <Text

          style={
            styles.emptyTitle
          }

        >

          No Products Found

        </Text>



        <Text

          style={
            styles.emptySubtitle
          }

        >

          Try searching with another keyword

        </Text>



      </View>

    );


  });






  /* =================================================
      ERROR COMPONENT
  ================================================= */


  const ErrorState = memo(()=>{


    return(

      <View
        style={
          styles.errorContainer
        }
      >



        <Ionicons

          name="cloud-offline-outline"

          size={70}

          color="#EF4444"

        />




        <Text

          style={
            styles.errorTitle
          }

        >

          Something went wrong

        </Text>





        <Text

          style={
            styles.errorMessage
          }

        >

          {error}

        </Text>





        <TouchableOpacity

          activeOpacity={0.85}

          style={
            styles.retryButton
          }

          onPress={()=>{

            fetchProducts(

              searchText,

              0

            );

          }}

        >


          <Text

            style={
              styles.retryText
            }

          >

            Retry

          </Text>



        </TouchableOpacity>




      </View>

    );


  });






  /* =================================================
      SKELETON LOADER
  ================================================= */


  const SkeletonCard = memo(()=>{


    const animatedValue =
      useRef(
        new Animated.Value(0)
      ).current;



    useEffect(()=>{


      Animated.loop(

        Animated.sequence([


          Animated.timing(

            animatedValue,

            {

              toValue:1,

              duration:900,

              useNativeDriver:true,

            }

          ),



          Animated.timing(

            animatedValue,

            {

              toValue:0,

              duration:900,

              useNativeDriver:true,

            }

          )


        ])

      ).start();



    },[]);




    const opacity =
      animatedValue.interpolate({

        inputRange:[0,1],

        outputRange:[0.4,0.9]

      });





    return(


      <Animated.View

        style={[

          styles.productCard,

          {
            opacity
          }

        ]}

      >



        <View

          style={
            styles.skeletonImage
          }

        />




        <View

          style={
            styles.skeletonContent
          }

        >



          <View

            style={
              styles.skeletonLineLarge
            }

          />



          <View

            style={
              styles.skeletonLineSmall
            }

          />



          <View

            style={
              styles.skeletonButton
            }

          />



        </View>



      </Animated.View>


    );


  });







  const LoadingSkeleton =
    memo(()=>{


      return(


        <View>


          {

            Array
              .from(
                {
                  length:5
                }
              )
              .map((_,index)=>(


                <SkeletonCard

                  key={index}

                />


              ))

          }


        </View>


      );


    });








  /* =================================================
      FOOTER LOADING
  ================================================= */



  const FooterLoader =
    memo(()=>{


      if(!loadingMore)
        return null;



      return(

        <View

          style={
            styles.footerLoader
          }

        >

          <ActivityIndicator

            size="large"

            color="#FF6B00"

          />


        </View>

      );


    });
      /* =================================================
      MAIN UI
  ================================================= */


  return (

    <SafeAreaView

      style={
        styles.safeArea
      }

    >


      <StatusBar

        barStyle="dark-content"

        backgroundColor="#F8F9FB"

      />



      <View

        style={
          styles.container
        }

      >





        {/* ================= HEADER ================= */}



        <View

          style={
            styles.header
          }

        >



          <Text

            style={
              styles.headerTitle
            }

          >

            Search Products

          </Text>




          <TouchableOpacity

            activeOpacity={0.8}

            onPress={()=>{

              navigation.goBack();

            }}

          >


            <Ionicons

              name="close"

              size={26}

              color="#111827"

            />



          </TouchableOpacity>



        </View>







        {/* ================= SEARCH BAR ================= */}



        <Animated.View

          style={[

            styles.searchContainer,

            {

              height:
              searchHeight,


              elevation:
              shadowAnimation,


            }

          ]}


        >



          <Ionicons

            name="search-outline"

            size={22}

            color="#667085"

          />





          <AnimatedTextInput


            value={
              searchText
            }


            onChangeText={
              setSearchText
            }



            placeholder=
              "Search products..."



            placeholderTextColor=
              "#98A2B3"



            style={
              styles.searchInput
            }



            autoCorrect={false}



            autoCapitalize="none"



            returnKeyType="search"



            onFocus={()=>{

              animateSearch(true);

            }}



            onBlur={()=>{

              animateSearch(false);

            }}



          />






          {

            searchText.length > 0 &&


            <TouchableOpacity

              onPress={()=>{


                setSearchText('');

                setProducts([]);

                Keyboard.dismiss();


              }}


            >


              <Ionicons

                name="close-circle"

                size={22}

                color="#98A2B3"

              />



            </TouchableOpacity>


          }






          <TouchableOpacity

            style={
              styles.voiceButton
            }

          >


            <Ionicons

              name="mic-outline"

              size={20}

              color="#FF6B00"

            />


          </TouchableOpacity>



        </Animated.View>







        {/* ================= HISTORY ================= */}




        {
          showHistory &&

          searchHistory.length > 0 &&



          <View

            style={
              styles.section
            }

          >



            <View

              style={
                styles.sectionHeader
              }

            >


              <Text

                style={
                  styles.sectionTitle
                }

              >

                Recent Searches

              </Text>





              <TouchableOpacity


                onPress={async()=>{


                  await AsyncStorage.removeItem(

                    SEARCH_HISTORY_KEY

                  );



                  setSearchHistory([]);



                }}



              >


                <Text

                  style={
                    styles.clearText
                  }

                >

                  Clear

                </Text>



              </TouchableOpacity>



            </View>






            <View

              style={
                styles.chipContainer
              }

            >



              {

                searchHistory.map(

                  (item,index)=>(


                    <TouchableOpacity


                      key={index}


                      style={
                        styles.historyChip
                      }


                      onPress={()=>{

                        setSearchText(item);

                      }}



                    >



                      <Ionicons

                        name="time-outline"

                        size={14}

                        color="#667085"

                      />




                      <Text

                        style={
                          styles.chipText
                        }

                      >

                        {item}

                      </Text>



                    </TouchableOpacity>


                  )


                )

              }



            </View>





          </View>


        }







        {/* ================= SUGGESTIONS ================= */}





        {

          showHistory &&



          <View

            style={
              styles.section
            }

          >



            <Text

              style={
                styles.sectionTitle
              }

            >

              Popular Searches

            </Text>





            <View

              style={
                styles.chipContainer
              }

            >



              {

                suggestions.map(

                  (item,index)=>(


                    <TouchableOpacity


                      key={index}


                      style={
                        styles.suggestionChip
                      }



                      onPress={()=>{

                        setSearchText(item);

                      }}


                    >



                      <Text

                        style={
                          styles.suggestionText
                        }

                      >

                        {item}

                      </Text>



                    </TouchableOpacity>


                  )

                )

              }



            </View>



          </View>


        }
                {/* ================= CONTENT ================= */}


        {

          error ?


          (

            <ErrorState />

          )


          :


          loading ?


          (

            <LoadingSkeleton />

          )


          :


          (

            <FlatList


              data={
                products
              }



              keyExtractor={
                item =>
                  item.id.toString()
              }




              renderItem={
                ({item})=>(

                  <ProductCard

                    item={item}

                  />

                )
              }




              showsVerticalScrollIndicator={
                false
              }





              contentContainerStyle={
                styles.listContainer
              }





              ListEmptyComponent={

                <EmptyState />

              }





              ListFooterComponent={

                <FooterLoader />

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
                    '#FF6B00'
                  ]}



                />


              }





              onEndReached={
                handleLoadMore
              }




              onEndReachedThreshold={
                0.5
              }





              keyboardShouldPersistTaps=
                "handled"





              removeClippedSubviews={
                true
              }





              initialNumToRender={
                8
              }





              maxToRenderPerBatch={
                8
              }





              windowSize={
                10
              }




            />


          )


        }



      </View>



    </SafeAreaView>


  );

}
const styles = StyleSheet.create({

  /* ===============================
      ROOT
  =============================== */


  safeArea:{
    flex:1,
    backgroundColor:'#F8F9FB',
  },


  container:{
    flex:1,
    paddingHorizontal:16,
  },



  /* ===============================
      HEADER
  =============================== */


  header:{
    height:60,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },


  headerTitle:{
    fontSize:22,
    fontWeight:'800',
    color:'#101828',
  },



  /* ===============================
      SEARCH BAR
  =============================== */


  searchContainer:{
    backgroundColor:'#FFFFFF',

    borderRadius:18,

    flexDirection:'row',

    alignItems:'center',

    paddingHorizontal:14,

    marginBottom:18,

    shadowColor:'#000',

    shadowOffset:{
      width:0,
      height:3,
    },

    shadowOpacity:0.08,

    shadowRadius:8,

  },



  searchInput:{
    flex:1,

    marginLeft:10,

    fontSize:16,

    color:'#101828',
  },



  voiceButton:{
    width:34,

    height:34,

    borderRadius:17,

    alignItems:'center',

    justifyContent:'center',

    backgroundColor:'#FFF4E8',

    marginLeft:8,
  },



  /* ===============================
      SECTIONS
  =============================== */


  section:{
    marginBottom:18,
  },



  sectionHeader:{
    flexDirection:'row',

    justifyContent:'space-between',

    alignItems:'center',

    marginBottom:12,
  },



  sectionTitle:{
    fontSize:16,

    fontWeight:'700',

    color:'#1D2939',
  },



  clearText:{
    color:'#FF6B00',

    fontSize:14,

    fontWeight:'600',
  },



  /* ===============================
      CHIPS
  =============================== */


  chipContainer:{
    flexDirection:'row',

    flexWrap:'wrap',
  },



  historyChip:{
    flexDirection:'row',

    alignItems:'center',

    backgroundColor:'#FFFFFF',

    paddingHorizontal:14,

    paddingVertical:9,

    borderRadius:20,

    marginRight:10,

    marginBottom:10,

    elevation:1,
  },



  chipText:{
    marginLeft:6,

    fontSize:13,

    color:'#475467',

    fontWeight:'500',
  },



  suggestionChip:{
    backgroundColor:'#FFF4E8',

    paddingHorizontal:15,

    paddingVertical:10,

    borderRadius:20,

    marginRight:10,

    marginBottom:10,
  },



  suggestionText:{
    color:'#FF6B00',

    fontSize:13,

    fontWeight:'700',
  },



  /* ===============================
      PRODUCT CARD
  =============================== */


  productCard:{
    backgroundColor:'#FFFFFF',

    borderRadius:18,

    padding:12,

    marginBottom:14,

    flexDirection:'row',

    elevation:3,

    shadowColor:'#000',

    shadowOffset:{
      width:0,
      height:3,
    },

    shadowOpacity:0.08,

    shadowRadius:8,
  },



  imageWrapper:{
    width:115,

    height:115,

    borderRadius:15,

    overflow:'hidden',

    backgroundColor:'#F2F4F7',

    position:'relative',
  },



  productImage:{
    width:'100%',

    height:'100%',
  },



  discountBadge:{
    position:'absolute',

    top:8,

    left:8,

    backgroundColor:'#16A34A',

    paddingHorizontal:8,

    paddingVertical:4,

    borderRadius:8,
  },



  discountText:{
    color:'#FFFFFF',

    fontSize:11,

    fontWeight:'800',
  },



  outStockBadge:{
    position:'absolute',

    bottom:8,

    left:8,

    backgroundColor:'#DC2626',

    paddingHorizontal:8,

    paddingVertical:5,

    borderRadius:8,
  },



  outStockText:{
    color:'#FFFFFF',

    fontSize:10,

    fontWeight:'700',
  },



  favoriteButton:{
    position:'absolute',

    right:8,

    top:8,

    width:32,

    height:32,

    borderRadius:16,

    backgroundColor:'#FFFFFF',

    justifyContent:'center',

    alignItems:'center',

    elevation:2,
  },



  /* ===============================
      PRODUCT DETAILS
  =============================== */


  productDetails:{
    flex:1,

    marginLeft:14,

    justifyContent:'space-between',
  },



  productName:{
    fontSize:15,

    fontWeight:'700',

    color:'#101828',

    lineHeight:20,
  },



  ratingBox:{
    flexDirection:'row',

    alignItems:'center',

    marginTop:5,
  },



  ratingText:{
    marginLeft:5,

    fontSize:12,

    fontWeight:'700',

    color:'#475467',
  },



  priceContainer:{
    flexDirection:'row',

    alignItems:'center',

    marginTop:5,
  },



  currentPrice:{
    fontSize:18,

    fontWeight:'800',

    color:'#111827',
  },



  oldPrice:{
    marginLeft:8,

    fontSize:13,

    color:'#98A2B3',

    textDecorationLine:'line-through',
  },



  brandText:{
    fontSize:12,

    color:'#667085',
  },

  /* ===============================
      STOCK
  =============================== */


  stockText:{
    fontSize:12,

    fontWeight:'600',

    marginTop:4,
  },



  /* ===============================
      CART BUTTON
  =============================== */


  cartButton:{
    height:38,

    borderRadius:12,

    backgroundColor:'#FF6B00',

    flexDirection:'row',

    alignItems:'center',

    justifyContent:'center',

    marginTop:8,
  },



  cartButtonText:{
    color:'#FFFFFF',

    fontSize:13,

    fontWeight:'700',

    marginLeft:6,
  },



  disabledCartButton:{
    backgroundColor:'#D0D5DD',
  },



  /* ===============================
      LIST
  =============================== */


  listContainer:{
    paddingBottom:40,
  },



  footerLoader:{
    paddingVertical:25,

    alignItems:'center',

    justifyContent:'center',
  },



  /* ===============================
      EMPTY STATE
  =============================== */


  emptyContainer:{
    flex:1,

    justifyContent:'center',

    alignItems:'center',

    marginTop:120,
  },



  emptyTitle:{
    marginTop:20,

    fontSize:19,

    fontWeight:'800',

    color:'#344054',
  },



  emptySubtitle:{
    marginTop:8,

    fontSize:14,

    color:'#98A2B3',

    textAlign:'center',
  },



  /* ===============================
      ERROR STATE
  =============================== */


  errorContainer:{
    flex:1,

    justifyContent:'center',

    alignItems:'center',

    paddingHorizontal:30,
  },



  errorTitle:{
    marginTop:18,

    fontSize:20,

    fontWeight:'800',

    color:'#344054',
  },



  errorMessage:{
    marginTop:8,

    fontSize:14,

    color:'#667085',

    textAlign:'center',
  },



  retryButton:{
    marginTop:20,

    paddingHorizontal:35,

    paddingVertical:12,

    borderRadius:25,

    backgroundColor:'#FF6B00',
  },



  retryText:{
    color:'#FFFFFF',

    fontWeight:'700',

    fontSize:14,
  },



  /* ===============================
      SKELETON
  =============================== */


  skeletonImage:{
    width:115,

    height:115,

    borderRadius:15,

    backgroundColor:'#E4E7EC',
  },



  skeletonContent:{
    flex:1,

    marginLeft:14,

    justifyContent:'space-around',
  },



  skeletonLineLarge:{
    width:'85%',

    height:16,

    borderRadius:8,

    backgroundColor:'#E4E7EC',
  },



  skeletonLineSmall:{
    width:'45%',

    height:12,

    borderRadius:8,

    backgroundColor:'#E4E7EC',
  },



  skeletonButton:{
    width:120,

    height:35,

    borderRadius:12,

    backgroundColor:'#E4E7EC',
  },



});