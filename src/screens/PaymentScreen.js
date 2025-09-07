import React, { useRef, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentScreen({ route, navigation }) {
  const { orderId, amount, product, user } = route.params; 
  const webviewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  if (!product || !amount || !orderId) {
    Alert.alert("Error", "Invalid payment data.");
    navigation.goBack();
    return null;
  }

    const razorpayHtml = `
    <html>
      <body>
        <script>
          // Simulate payment response after 2s
          setTimeout(function(){
            const mockResponse = {
              razorpay_payment_id: "pay_mock_12345",
              razorpay_order_id: ${JSON.stringify(orderId)},
              razorpay_signature: "mock_signature"
            };
            window.ReactNativeWebView.postMessage(JSON.stringify(mockResponse));
          }, 2000);
        </script>
        <h2 style="text-align:center;margin-top:50%;">Simulating Payment...</h2>
      </body>
    </html>
    `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      navigation.replace('PaymentResult', { paymentResponse: data, product });
    } catch (err) {
      console.error("Payment parse error:", err);
      Alert.alert("Payment Failed", "Unable to process payment response.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#53a20e" />
        </View>
      )}
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: razorpayHtml }}
        onMessage={handleMessage}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled={true}
        domStorageEnabled={true}           // ✅ enable DOM storage
        startInLoadingState={true}         // ✅ default loader
        mixedContentMode="compatibility"   // ✅ allow mixed content
        allowFileAccess={true}             // ✅ allow file access
        allowUniversalAccessFromFileURLs={true}  // ✅ allow JS from local HTML
        onShouldStartLoadWithRequest={(request) => true}  // ✅ allow all requests
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // optional: overlay background
    zIndex: 10,
  },
});
