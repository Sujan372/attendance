// Notification Service

const sendSMS = async (phone, message) => {
    try {
        // Temporary testing version
        // Later we will connect a real SMS provider here.

        console.log("=================================");
        console.log("SMS NOTIFICATION");
        console.log("To:", phone);
        console.log("Message:", message);
        console.log("=================================");

        return {
            success: true,
            message: "SMS notification sent successfully"
        };

    } catch (error) {
        console.error("SMS error:", error);

        return {
            success: false,
            message: "Failed to send SMS"
        };
    }
};


// Student absent notification
const sendAbsentNotification = async (
    guardianPhone,
    studentName,
    date
) => {

    const message =
        `Dear Parent/Guardian, ${studentName} was marked absent on ${date}. Please contact the school if required.`;

    return await sendSMS(
        guardianPhone,
        message
    );
};


module.exports = {
    sendSMS,
    sendAbsentNotification
};