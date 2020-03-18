
import React, { useState } from 'react';

import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Dialog, Portal, Text } from 'react-native-paper';

import { CalendarList } from 'react-native-calendars';

import RNGooglePlaces from 'react-native-google-places';

const styles = StyleSheet.create({
    actionButton: {
        borderRadius: 32,
        borderColor: "rgba(50,20,190,1)",
        borderWidth: 1,
        marginTop: 8,
        padding: 2
    },
    actionButtonLabel: {
        fontSize: 12
    },
    coloredText: {
        color: "rgba(50,20,190,1)"
    },
    dialogLocation: {
        marginBottom: 16
    }
});

export default function LocationsStep(props) {

    const [locationsAndDates, setLocationsAndDates] = useState(props.stepItem.initialProps || []);
    const [isModalVisible, setModalVisible] = useState(false);

    const [dialogLocation, setDialogLocation] = useState({});
    const [dialogSelectedDates, setDialogSelectedDates] = useState({});

    const _showDialog = () => setModalVisible(true);
    const _hideDialog = () => setModalVisible(false);

    let openPlacesSearchModal = () => {
        RNGooglePlaces.openAutocompleteModal()
        .then((place) => {
            setDialogLocation(place);
            // place represents user's selection from the
            // suggestions and it is a simplified Google Place object.
        })
        .catch(error => console.log(error.message));  // error is a Javascript Error object
    }

    let onDayPress = (day) => {
        let modifiedDialogSelectedDays = {...dialogSelectedDates};
        if (day.dateString in modifiedDialogSelectedDays) {
            delete modifiedDialogSelectedDays[day.dateString ];
        }
        else {
            modifiedDialogSelectedDays[day.dateString] = {
                selected: true,
                disableTouchEvent: false,
                selectedDotColor: 'orange',
                // set both to true so that it is marked correctly
                startingDate: true,
                endingDate: true,
                timestamp: day.timestamp
            }
        }
        setDialogSelectedDates(modifiedDialogSelectedDays);
    }

    let onAddPlace = (location, dates) => {
        let locationAndDates = {
            location: location,
            dates: dates
        }

        setDialogLocation({});
        setDialogSelectedDates({});
        locationAndDates = [...locationsAndDates, locationAndDates];
        setLocationsAndDates(locationAndDates);
        _hideDialog();

        const nextEnabled = (locationAndDates.length > 0) ? true : false;
        props.stepItem.onFinish(locationAndDates, nextEnabled);
    }

    return (
        <View>
            <View style={styles.itemList}>
                {locationsAndDates.map((item, index) => {
                    
                    let earliestDateKey;
                    let latestDateKey;
                    for (let key in item.dates) {
                        let date = item.dates[key];
                        if (earliestDateKey === undefined || date.timestamp < item.dates[earliestDateKey].timestamp) {
                            earliestDateKey = key; 
                        }
                        if (latestDateKey === undefined || date.timestamp > item.dates[latestDateKey].timestamp) {
                            latestDateKey = key;
                        }
                    }

                    return (
                        <Card 
                            key={index}
                            style={styles.cardItem}
                        >
                            <Card.Title 
                                title={item.location.address}
                                subtitle={earliestDateKey + " to " + latestDateKey}
                            />
                            {/* {Object.entries(item.dates).map(([key, value]) => (
                                <Text>{key}</Text>
                            ))} */}
                        </Card>
                    )
                })}

                <Button 
                    mode="outlined"
                    style={styles.actionButton}
                    labelStyle={styles.actionButtonLabel}
                    onPress={() => _showDialog()}>
                    Add a location
                </Button>
            </View>

            <Portal>
                <Dialog
                    style={{height: "80%"}}
                    visible={isModalVisible}
                    onDismiss={_hideDialog}>
                    <Dialog.Title>Location and Time</Dialog.Title>
                    {/* <Dialog.Content> */}
                        {/* <Paragraph>This is simple dialog</Paragraph> */}
                        <Dialog.ScrollArea>
                        <ScrollView>
                            <View style={styles.dialogLocation}>
                                <Text>
                                    Location:  
                                    
                                </Text>
                                <Text 
                                        style={styles.coloredText}
                                        onPress={() => openPlacesSearchModal()}>
                                        {dialogLocation.address || "Click to pick a location"}
                                    </Text>
                                
                                {/* <Button
                                    style={styles.actionButton}
                                    labelStyle={styles.actionButtonLabel}
                                    onPress={() => openPlacesSearchModal()}>
                                    Pick a location
                                </Button> */}
                            </View>  
                            <View>
                                <Text>Select the dates on which you have been here:</Text>
                                <CalendarList
                                    // Max amount of months allowed to scroll to the past. Default = 50
                                    pastScrollRange={1}
                                    // Max amount of months allowed to scroll to the future. Default = 50
                                    futureScrollRange={0}
                                    // Enable or disable scrolling of calendar list
                                    scrollEnabled={true}
                                    
                                    horizontal={true}

                                    pagingEnabled={true}

                                    // Enable or disable vertical scroll indicator. Default = false
                                    showScrollIndicator={true}
                                    
                                    onDayPress={onDayPress}
                                    markedDates={dialogSelectedDates}
                                />
                            </View>
                        </ScrollView>
                        </Dialog.ScrollArea>
                        {/* <Text>Dates: {dialogDates}</Text>
                        <Button onPress={() => openCalendarModal()}>
                            Pick dates
                        </Button> */}
                    {/* </Dialog.Content> */}
                    <Dialog.Actions>
                        <Button
                            disabled={Object.keys(dialogLocation).length === 0}
                            onPress={() => onAddPlace(dialogLocation, dialogSelectedDates)}
                        >
                            Add
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}
