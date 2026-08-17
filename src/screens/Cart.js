import React, {
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from 'react';


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';


import {
  SafeAreaView,
} from 'react-native-safe-area-context';


import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';


import {
  Ionicons,
} from '@expo/vector-icons';


import {
  useCart,
} from '../context/CartContext';





/* =================================================
    CONSTANTS
================================================= */


const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/300';





/* =================================================
    CART SCREEN
================================================= */


export default function CartScreen(){


  const navigation =
    useNavigation();



  const {
    cartItems,
    clearCart,
    removeFromCart,
    reloadCart,
    updateQuantity,
    totalAmount,
    totalQuantity,
  } =
    useCart();




  /* ===============================================
      STATES
  =============================================== */


  const [
    editMode,
    setEditMode
  ] =
  useState(false);



  const [
    selectedItems,
    setSelectedItems
  ] =
  useState([]);



  const [
    refreshing,
    setRefreshing
  ] =
  useState(false);



  const [
    loading,
    setLoading
  ] =
  useState(false);



  const [
    deleting,
    setDeleting
  ] =
  useState(false);



  const [
    processingOrder,
    setProcessingOrder
  ] =
  useState(false);





  /* ===============================================
      ANIMATION
  =============================================== */


  const bottomAnimation =
    useRef(
      new Animated.Value(0)
    ).current;





  /* ===============================================
      LOAD CART WHEN SCREEN FOCUS
  =============================================== */


  useFocusEffect(

    useCallback(()=>{


      const loadCart =
        async()=>{


          try{


            setLoading(true);


            await reloadCart();


          }
          catch(error){


            console.log(
              "Cart loading error:",
              error
            );


          }
          finally{


            setLoading(false);


          }


        };



      loadCart();



    },[])

  );





  /* ===============================================
      TOTAL CALCULATION
  =============================================== */


  const cartSummary =
    useMemo(()=>{


      // Server-authoritative totals from the CartResponse.
      return {


        subtotal:
          totalAmount,

        quantity:
          totalQuantity,


        delivery:
          0,


        total:
          totalAmount,


      };



    },[
      totalAmount,
      totalQuantity
    ]);
    
  /* ===============================================
      EDIT MODE
  =============================================== */


  const toggleEditMode =
    ()=>{


      setEditMode(
        previous => !previous
      );


      setSelectedItems([]);


    };






  /* ===============================================
      SELECT ITEM
  =============================================== */


  const toggleSelectItem =
    (id)=>{


      setSelectedItems(

        previous=>{


          if(
            previous.includes(id)
          )
          {


            return previous.filter(

              itemId =>
                itemId !== id

            );


          }



          return [

            ...previous,

            id

          ];


        }

      );


    };








  /* ===============================================
      DELETE SELECTED ITEMS
  =============================================== */


  const deleteSelectedItems =
    async()=>{


      if(
        selectedItems.length === 0
      )
      {

        return;

      }




      Alert.alert(

        "Delete Items",

        "Are you sure you want to remove selected items?",


        [

          {
            text:"Cancel",

            style:"cancel",

          },


          {

            text:"Delete",

            style:"destructive",


            onPress:async()=>{


              try{


                setDeleting(true);



                for(
                  const id of selectedItems
                ){

                  await removeFromCart(
                    id
                  );

                }



                setSelectedItems([]);


                setEditMode(false);



              }
              catch(error){


                Alert.alert(

                  "Error",

                  error.message ||
                  "Unable to delete items"

                );


              }
              finally{


                setDeleting(false);


              }



            }


          }


        ]

      );


    };








  /* ===============================================
      PLACE ORDER
  =============================================== */


  const placeOrder =
    async()=>{


      if(
        !cartItems ||
        cartItems.length === 0
      )
      {


        Alert.alert(

          "Cart Empty",

          "Please add products before checkout"

        );


        return;

      }




      try{


        setProcessingOrder(true);



        // Checkout flow: pick a delivery address, then review the order.
        navigation.navigate(

          "DeliveryAddress",

          {

            selectMode:true,

          }

        );



      }
      catch(error){


        Alert.alert(

          "Order Failed",

          error.message ||
          "Something went wrong"

        );


      }
      finally{


        setProcessingOrder(false);


      }



    };







  /* ===============================================
      REFRESH CART
  =============================================== */


  const handleRefresh =
    async()=>{


      try{


        setRefreshing(true);


        await reloadCart();



      }
      finally{


        setRefreshing(false);


      }



    };








  /* ===============================================
      PRODUCT CLICK
  =============================================== */


  const handleProductPress =
    (item)=>{


      if(editMode)
      {


        toggleSelectItem(
          item.id
        );


        return;


      }



      navigation.navigate(

        "SelectedProduct",

        {

          id:
          item.productId

        }

      );


    };







  /* ===============================================
      ITEM QUANTITY DISPLAY
  =============================================== */


  const getQuantity =
    (item)=>{


      return (

        item.quantity ||

        1

      );


    };
    
  /* ===============================================
      CART ITEM COMPONENT
  =============================================== */


  const CartItem =
    memo(
      ({
        item
      })=>{


        const [
          imageLoaded,
          setImageLoaded
        ] =
        useState(false);



        const selected =
          selectedItems.includes(
            item.id
          );



        const quantity =
          getQuantity(item);




        const itemPrice =
          Number(
            item.price || 0
          );




        const changeQuantity =
          async(nextQuantity)=>{

            if(
              nextQuantity < 1
            )
            {

              return;

            }


            const result =
            await updateQuantity(
              item.id,
              nextQuantity
            );


            if(
              !result.success
            )
            {

              Alert.alert(
                "Error",
                result.message
              );

            }

          };



        const totalPrice =
          itemPrice *
          quantity;





        return(


          <TouchableOpacity

            activeOpacity={
              0.9
            }


            style={[

              styles.cartCard,


              selected &&
              styles.selectedCard


            ]}



            onPress={()=>{


              handleProductPress(
                item
              );


            }}


          >





            {/* SELECT CHECKBOX */}



            {
              editMode &&


              <TouchableOpacity

                style={

                  styles.checkbox

                }


                onPress={()=>{

                  toggleSelectItem(
                    item.id
                  );

                }}

              >


                <Ionicons


                  name={

                    selected

                    ?

                    "checkmark-circle"

                    :

                    "ellipse-outline"

                  }


                  size={24}


                  color={

                    selected

                    ?

                    "#FF6B00"

                    :

                    "#98A2B3"

                  }


                />


              </TouchableOpacity>


            }








            {/* IMAGE */}




            <View

              style={
                styles.imageContainer
              }

            >



              {
                !imageLoaded &&


                <View

                  style={
                    styles.imageLoader
                  }

                >

                  <ActivityIndicator

                    size="small"

                    color="#FF6B00"

                  />


                </View>


              }




              <Image


                source={


                  item.imageUrl


                  ?

                  {
                    uri:
                    item.imageUrl
                  }


                  :

                  {
                    uri:
                    PLACEHOLDER_IMAGE
                  }


                }



                style={
                  styles.productImage
                }



                onLoad={()=>{

                  setImageLoaded(
                    true
                  );

                }}



              />



            </View>









            {/* DETAILS */}



            <View

              style={
                styles.itemDetails
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






              {
                item.brand &&


                <Text

                  style={
                    styles.brand
                  }

                >

                  {item.brand}


                </Text>


              }







              <View

                style={
                  styles.priceRow
                }

              >



                <Text

                  style={
                    styles.price
                  }

                >

                  ₹{itemPrice}


                </Text>



                {

                  item.actualPrice &&

                  Number(
                    item.actualPrice
                  ) >

                  itemPrice &&



                  <Text

                    style={
                      styles.oldPrice
                    }

                  >

                    ₹{item.actualPrice}


                  </Text>


                }



              </View>







              <View

                style={
                  styles.bottomRow
                }

              >



                <View

                  style={
                    styles.quantityBox
                  }

                >



                  <TouchableOpacity

                    style={
                      styles.quantityButton
                    }

                    onPress={() =>
                      changeQuantity(
                        quantity - 1
                      )
                    }

                  >


                    <Ionicons

                      name="remove"

                      size={16}

                      color="#344054"

                    />


                  </TouchableOpacity>





                  <Text

                    style={
                      styles.quantityText
                    }

                  >

                    {quantity}


                  </Text>






                  <TouchableOpacity

                    style={
                      styles.quantityButton
                    }

                    onPress={() =>
                      changeQuantity(
                        quantity + 1
                      )
                    }

                  >


                    <Ionicons

                      name="add"

                      size={16}

                      color="#344054"

                    />


                  </TouchableOpacity>



                </View>







                <Text

                  style={
                    styles.totalPrice
                  }

                >

                  ₹{totalPrice}


                </Text>



              </View>






            </View>





          </TouchableOpacity>


        );


      }


    );




  CartItem.displayName =
    "CartItem";






  /* ===============================================
      EMPTY CART COMPONENT
  =============================================== */


  const EmptyCart =
    ()=>{


      return(


        <View

          style={
            styles.emptyContainer
          }

        >



          <Ionicons

            name="cart-outline"

            size={90}

            color="#D0D5DD"

          />




          <Text

            style={
              styles.emptyTitle
            }

          >

            Your cart is empty


          </Text>





          <Text

            style={
              styles.emptySubtitle
            }

          >

            Add products and start shopping


          </Text>





          <TouchableOpacity

            style={
              styles.shopButton
            }


            onPress={()=>{

              navigation.navigate(
                "Home"
              );

            }}

          >


            <Text

              style={
                styles.shopButtonText
              }

            >

              Continue Shopping


            </Text>



          </TouchableOpacity>





        </View>


      );


    };
    
  /* ===============================================
      LOADING SKELETON
  =============================================== */


  const CartSkeleton =
    ()=>{


      return(


        <View

          style={
            styles.skeletonWrapper
          }

        >



          {
            Array
            .from({
              length:4
            })
            .map(
              (_,index)=>(


                <View

                  key={index}

                  style={
                    styles.skeletonCard
                  }

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
                        styles.skeletonLarge
                      }

                    />


                    <View

                      style={
                        styles.skeletonSmall
                      }

                    />


                    <View

                      style={
                        styles.skeletonButton
                      }

                    />



                  </View>



                </View>


              )

            )

          }



        </View>


      );


    };








  /* ===============================================
      DELETE LOADING OVERLAY
  =============================================== */


  const LoadingOverlay =
    ({
      text
    })=>{


      return(


        <View

          style={
            styles.loadingOverlay
          }

        >


          <ActivityIndicator

            size="large"

            color="#FF6B00"

          />


          <Text

            style={
              styles.loadingText
            }

          >

            {text}


          </Text>



        </View>


      );


    };







  /* ===============================================
      MAIN RETURN
  =============================================== */


  return(


    <SafeAreaView

      style={
        styles.safeArea
      }

    >



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



          <View>


            <Text

              style={
                styles.heading
              }

            >

              My Cart


            </Text>



            <Text

              style={
                styles.subHeading
              }

            >

              {cartSummary.quantity}
              {" "}
              items in your cart


            </Text>


          </View>






          {

            cartItems.length > 0 &&


            <TouchableOpacity

              style={
                styles.editButton
              }


              onPress={
                toggleEditMode
              }

            >



              <Ionicons

                name={
                  editMode
                  ?
                  "close"
                  :
                  "create-outline"
                }

                size={20}

                color="#FF6B00"

              />



              <Text

                style={
                  styles.editText
                }

              >

                {
                  editMode
                  ?
                  "Cancel"
                  :
                  "Edit"
                }


              </Text>


            </TouchableOpacity>


          }



        </View>







        {/* ================= CONTENT ================= */}




        {

          loading ?


          (

            <CartSkeleton />


          )


          :


          cartItems.length === 0


          ?


          (

            <EmptyCart />


          )


          :


          (



            <FlatList


              data={
                cartItems
              }



              keyExtractor={

                item=>
                item.id.toString()

              }



              renderItem={

                ({
                  item
                })=>(


                  <CartItem

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



              refreshControl={


                <RefreshControl


                  refreshing={
                    refreshing
                  }



                  onRefresh={
                    handleRefresh
                  }



                  colors={[
                    "#FF6B00"
                  ]}


                />


              }



            />


          )


        }



      {/* =================================================
            BOTTOM CHECKOUT SECTION
        ================================================= */}


        {
          cartItems.length > 0 &&


          <View

            style={
              styles.checkoutContainer
            }

          >




            {/* PRICE SUMMARY */}



            <View

              style={
                styles.summaryRow
              }

            >


              <Text

                style={
                  styles.summaryLabel
                }

              >

                Subtotal


              </Text>



              <Text

                style={
                  styles.summaryValue
                }

              >

                ₹{cartSummary.subtotal}


              </Text>


            </View>






            <View

              style={
                styles.summaryRow
              }

            >


              <Text

                style={
                  styles.summaryLabel
                }

              >

                Delivery Charge


              </Text>



              <Text

                style={
                  styles.summaryValue
                }

              >

                {
                  cartSummary.delivery === 0

                  ?

                  "FREE"

                  :

                  `₹${cartSummary.delivery}`

                }


              </Text>


            </View>








            <View

              style={
                styles.divider
              }

            />






            <View

              style={
                styles.totalRow
              }

            >



              <Text

                style={
                  styles.totalLabel
                }

              >

                Total Amount


              </Text>




              <Text

                style={
                  styles.totalAmount
                }

              >

                ₹{cartSummary.total}


              </Text>



            </View>








            {/* DELETE SELECTED */}



            {

              editMode &&

              selectedItems.length > 0 &&


              <TouchableOpacity


                activeOpacity={0.85}


                style={
                  styles.deleteSelectedButton
                }


                onPress={
                  deleteSelectedItems
                }


              >



                {

                  deleting


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

                        name="trash-outline"

                        size={18}

                        color="#FFFFFF"

                      />



                      <Text

                        style={
                          styles.deleteSelectedText
                        }

                      >

                        Delete Selected (
                        {selectedItems.length}
                        )

                      </Text>



                    </>

                  )


                }



              </TouchableOpacity>



            }









            {/* CHECKOUT BUTTON */}




            <TouchableOpacity


              activeOpacity={0.9}


              style={
                styles.checkoutButton
              }


              disabled={
                processingOrder
              }


              onPress={
                placeOrder
              }


            >



              {

                processingOrder


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

                      name="card-outline"

                      size={20}

                      color="#FFFFFF"

                    />



                    <Text

                      style={
                        styles.checkoutText
                      }

                    >

                      Proceed To Checkout


                    </Text>



                  </>


                )


              }



            </TouchableOpacity>






          </View>


        }







        {/* =================================================
            LOADING OVERLAY
        ================================================= */}



        {

          deleting &&


          (

            <LoadingOverlay

              text="Removing items..."

            />

          )

        }




      </View>



    </SafeAreaView>


  );
  
        

}

const styles = StyleSheet.create({


  /* =================================================
      ROOT
  ================================================= */


  safeArea:{
    flex:1,

    backgroundColor:'#F8F9FB',
  },



  container:{
    flex:1,

    paddingHorizontal:16,
  },





  /* =================================================
      HEADER
  ================================================= */


  header:{
    height:75,

    flexDirection:'row',

    alignItems:'center',

    justifyContent:'space-between',

  },



  heading:{
    fontSize:26,

    fontWeight:'800',

    color:'#101828',
  },



  subHeading:{
    marginTop:4,

    fontSize:13,

    color:'#667085',

    fontWeight:'500',
  },



  editButton:{
    flexDirection:'row',

    alignItems:'center',

    backgroundColor:'#FFF4E8',

    paddingHorizontal:14,

    paddingVertical:8,

    borderRadius:20,
  },



  editText:{
    marginLeft:5,

    color:'#FF6B00',

    fontSize:14,

    fontWeight:'700',
  },





  /* =================================================
      CART LIST
  ================================================= */



  listContainer:{
    paddingBottom:230,
  },





  /* =================================================
      CART CARD
  ================================================= */



  cartCard:{
    backgroundColor:'#FFFFFF',

    borderRadius:20,

    padding:12,

    marginBottom:14,

    flexDirection:'row',

    alignItems:'center',


    shadowColor:'#000',

    shadowOffset:{
      width:0,

      height:3,
    },


    shadowOpacity:0.08,


    shadowRadius:8,


    elevation:3,

  },




  selectedCard:{
    borderWidth:1.5,

    borderColor:'#FF6B00',

    backgroundColor:'#FFF8F2',
  },





  checkbox:{
    marginRight:8,
  },





  /* =================================================
      IMAGE
  ================================================= */



  imageContainer:{
    width:90,

    height:90,

    borderRadius:16,

    overflow:'hidden',

    backgroundColor:'#F2F4F7',

    justifyContent:'center',

    alignItems:'center',

  },




  productImage:{
    width:'100%',

    height:'100%',
  },




  imageLoader:{
    position:'absolute',

    zIndex:1,
  },





  /* =================================================
      ITEM DETAILS
  ================================================= */



  itemDetails:{
    flex:1,

    marginLeft:14,

  },




  productName:{
    fontSize:15,

    fontWeight:'700',

    color:'#101828',

    lineHeight:20,

  },




  brand:{
    marginTop:4,

    fontSize:12,

    color:'#667085',
  },





  priceRow:{
    flexDirection:'row',

    alignItems:'center',

    marginTop:6,

  },




  price:{
    fontSize:17,

    fontWeight:'800',

    color:'#111827',
  },




  oldPrice:{
    marginLeft:8,

    fontSize:13,

    color:'#98A2B3',

    textDecorationLine:'line-through',

  },





  bottomRow:{
    marginTop:10,

    flexDirection:'row',

    alignItems:'center',

    justifyContent:'space-between',

  },
  

  /* =================================================
      QUANTITY CONTROL
  ================================================= */


  quantityBox:{
    flexDirection:'row',

    alignItems:'center',

    backgroundColor:'#F2F4F7',

    borderRadius:12,

    height:34,

    paddingHorizontal:4,
  },



  quantityButton:{
    width:30,

    height:30,

    borderRadius:15,

    justifyContent:'center',

    alignItems:'center',

    backgroundColor:'#FFFFFF',
  },



  quantityText:{
    width:32,

    textAlign:'center',

    fontSize:14,

    fontWeight:'700',

    color:'#344054',
  },



  totalPrice:{
    fontSize:16,

    fontWeight:'800',

    color:'#FF6B00',
  },







  /* =================================================
      CHECKOUT CONTAINER
  ================================================= */


  checkoutContainer:{
    position:'absolute',

    bottom:0,

    left:0,

    right:0,


    backgroundColor:'#FFFFFF',


    paddingHorizontal:16,


    paddingTop:18,


    paddingBottom:25,


    borderTopLeftRadius:26,


    borderTopRightRadius:26,



    shadowColor:'#000',

    shadowOffset:{
      width:0,

      height:-4,
    },


    shadowOpacity:0.12,


    shadowRadius:10,


    elevation:20,

  },







  summaryRow:{
    flexDirection:'row',

    justifyContent:'space-between',

    marginBottom:8,

  },




  summaryLabel:{
    fontSize:14,

    color:'#667085',

    fontWeight:'500',
  },




  summaryValue:{
    fontSize:14,

    color:'#344054',

    fontWeight:'600',
  },





  divider:{
    height:1,

    backgroundColor:'#EAECF0',

    marginVertical:12,
  },





  totalRow:{
    flexDirection:'row',

    justifyContent:'space-between',

    alignItems:'center',

    marginBottom:14,

  },





  totalLabel:{
    fontSize:17,

    fontWeight:'800',

    color:'#101828',
  },





  totalAmount:{
    fontSize:22,

    fontWeight:'900',

    color:'#FF6B00',
  },







  /* =================================================
      CHECKOUT BUTTON
  ================================================= */


  checkoutButton:{
    height:52,

    borderRadius:16,

    backgroundColor:'#FF6B00',

    flexDirection:'row',

    justifyContent:'center',

    alignItems:'center',

    gap:8,

  },





  checkoutText:{
    color:'#FFFFFF',

    fontSize:16,

    fontWeight:'800',
  },







  /* =================================================
      DELETE BUTTON
  ================================================= */


  deleteSelectedButton:{
    height:46,

    borderRadius:14,

    backgroundColor:'#DC2626',

    flexDirection:'row',

    justifyContent:'center',

    alignItems:'center',

    marginBottom:12,

    gap:8,

  },




  deleteSelectedText:{
    color:'#FFFFFF',

    fontSize:14,

    fontWeight:'700',
  },





  /* =================================================
      EMPTY CART
  ================================================= */


  emptyContainer:{
    flex:1,

    justifyContent:'center',

    alignItems:'center',

    paddingBottom:100,

  },





  emptyTitle:{
    marginTop:20,

    fontSize:20,

    fontWeight:'800',

    color:'#344054',

  },





  emptySubtitle:{
    marginTop:8,

    fontSize:14,

    color:'#98A2B3',

  },





  shopButton:{
    marginTop:25,

    backgroundColor:'#FF6B00',

    paddingHorizontal:30,

    paddingVertical:14,

    borderRadius:25,

  },





  shopButtonText:{
    color:'#FFFFFF',

    fontWeight:'700',

    fontSize:14,

  },
  


  /* =================================================
      LOADING OVERLAY
  ================================================= */


  loadingOverlay:{
    ...StyleSheet.absoluteFillObject,

    backgroundColor:'rgba(255,255,255,0.85)',

    justifyContent:'center',

    alignItems:'center',

    zIndex:999,

  },



  loadingText:{
    marginTop:12,

    fontSize:15,

    fontWeight:'600',

    color:'#475467',

  },







  /* =================================================
      SKELETON LOADING
  ================================================= */



  skeletonWrapper:{
    paddingTop:10,
  },




  skeletonCard:{
    height:120,

    backgroundColor:'#FFFFFF',

    borderRadius:20,

    marginBottom:14,

    padding:12,

    flexDirection:'row',

    alignItems:'center',

  },





  skeletonImage:{
    width:90,

    height:90,

    borderRadius:16,

    backgroundColor:'#EAECF0',

  },





  skeletonContent:{
    flex:1,

    marginLeft:15,

  },





  skeletonLarge:{
    width:'75%',

    height:16,

    borderRadius:8,

    backgroundColor:'#EAECF0',

    marginBottom:12,

  },





  skeletonSmall:{
    width:'45%',

    height:14,

    borderRadius:7,

    backgroundColor:'#EAECF0',

    marginBottom:15,

  },





  skeletonButton:{
    width:100,

    height:32,

    borderRadius:10,

    backgroundColor:'#EAECF0',

  },



});
