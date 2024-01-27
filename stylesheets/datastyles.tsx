import { StyleSheet, Dimensions } from "react-native";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1, 
        borderWidth: 1, 
        borderColor: 'black',
        paddingTop: 10,
        paddingRight: 40,
        paddingLeft: 40,
        height: windowHeight,
    },
    middleContainer: {
        alignItems: "center",
        margin: 5,
        borderWidth: 1, 
        borderColor: 'black',
        backgroundColor: "lightblue",
        padding: 5,
        borderRadius: 20,
        width: windowWidth - 90
    },
    innerContainer: {
        alignItems: "center",
        borderWidth: 1, 
        borderColor: 'black',
        margin: 5,
        backgroundColor: "white",
        padding: 10,
        width: 250,
        borderRadius: 20
    },
    dataTitle: {
        fontWeight: "bold",
        fontSize: 30
    }, 
    dataRating: {
        fontWeight: "bold",
        textAlign: "center"
    },
    dataComment: {
        textAlign: "center"
    },
    averageRatingContainer: {
        alignItems: "center",
        margin: 5,
    },
    historyContainer: {
        borderWidth: 1, 
        borderColor: 'black',
        marginBottom: 30,
        borderRadius: 20,
        backgroundColor: "lightblue",
        alignItems: "center",
        width: windowWidth - 90,
        alignSelf: "center",
    },
    historyDataContainer: {
        borderWidth: 1, 
        borderColor: 'black',
        padding: 5,
        margin: 5,
        borderRadius: 20,
        backgroundColor: "white",
        width: 250,
    },
    footerContainer: {
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: "center"
    },
    historyText: {
        fontWeight: "bold",
        fontSize: 20,
        paddingTop: 5
    },
    loadingContainer: {
        alignItems: "center"
    },
    loadingText: {
        fontWeight: 'bold'
    }
})

export default styles;