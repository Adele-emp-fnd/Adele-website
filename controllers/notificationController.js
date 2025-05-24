import db from "../config/db.js";

export const addNotification = async (req, res) => {


  console.log("notification route hitted");

  const { department, message } = req.body;

  console.log("the department and the message are :", department, message);


  // 3a) Validate
  if (!department || !message) {
    return res.status(400).json({
      status: 'error',
      message: 'Both `department` and `message` are required.'
    });
  }

  const existingNotification = await db.query("SELECT * FROM notifications WHERE department = $1 OR department = 'general' ", [department])

  console.log("the available notifications are: ", existingNotification);



  try {
    // 3b) Insert
    const result = await db.query(
      `INSERT INTO notifications (department, message)
         VALUES ($1, $2)
         RETURNING id, created_at`,
      [department.toLowerCase(), message]
    );

    console.log("the current id is", result.rows[0].id);
    const currentNotificationId = result.rows[0].id;





    const notificationId = result.rows[0].id
    console.log("the notification id is", notificationId);


    const updateNotification = await db.query("INSERT INTO user_notifications (notification_id) VALUES ($1)", [notificationId])



    const inserted = result.rows[0];
    res.json({
      message: 'ok',
      id: inserted.id,
      created_at: inserted.created_at
    });

  } catch (err) {
    console.error('DB INSERT ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Database error.'
    });
  }

}


export const fetchNotification = async (req, res) => {

  console.log("fetch notification route hit");
  const dept = req.headers.department;
  console.log("department header:", dept);

  if (!dept) {
    return res.status(400).json({
      status: 'error',
      message: '`department` header is required.'
    });
  }

  try {
    const result = await db.query(
      `SELECT 
      n.id, 
      n.message, 
      n.department,
      n.created_at,
      COALESCE(un.is_read, FALSE) AS is_read
      FROM notifications n
       LEFT JOIN user_notifications un 
      ON n.id = un.notification_id AND un.user_id = $1
       WHERE n.department = $2 OR n.department = 'general'
       ORDER BY n.created_at DESC`,
      [userId, department]
    );
    console.log("db rows:", result.rows);
    res.json({
      status: 'success',
      availableNotifications: result.rows    // <-- renamed
    });

  } catch (err) {
    console.error('DB SELECT ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Database error.'
    });
  }






}

export const fetchRoute = async (req, res) => {
  console.log("fetch route hitted!!!!");
  const { department, userId } = req.body;
  console.log("department header and the user id are:", department, userId);

  if (!department) {
    return res.status(400).json({
      status: 'error',
      message: '`department` is required.'
    });
  }

  try {

    const isUnrad = await db.query("SELECT is_unread, notification_id FROM user_notifications WHERE user_id = $1", [userId])
    console.log("the unread notifications is ", isUnrad.rows);

    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE department = $1 OR department = 'general' 
        ORDER BY created_at DESC LIMIT 100`,
      [department]
    );
    const availableNotifications = result.rows
    console.log("the available notifications is ", availableNotifications);
    

    const userCheck = result.rows;
   



    console.log("db time is:",);
    res.json({
      status: 'success',
      availableNotifications: availableNotifications,    // <-- renamed
      isUnread: isUnrad.rows
    });

  } catch (err) {
    console.error('DB SELECT ERROR', err);
    res.status(500).json({
      status: 'error',
      message: 'Database error.'
    });
  }
}


export const markRead = async (req, res) => {
  console.log("marked route hitted??");

  const { id, department, userId } = req.body;


  if (!id) {
    return res.status(400).json({
      status: 'error',
      message: 'Notification ID is required'
    });
  }

  try {

    const checkUnreadMark = await db.query("SELECT * FROM user_notifications WHERE user_id = $1 AND notification_id = $2 AND is_unread = FALSE", [userId, id]);
    if (checkUnreadMark.rowCount <= 0) {
      await db.query(
        `INSERT INTO user_notifications (user_id, notification_id, is_read, is_unread)
        VALUES ($1, $2, TRUE, FALSE)`,
        [userId, id,]);

        res.json({
          status: 'success',
          message: 'Notification marked as read'
        });


    } else {
      console.log("notification already marked");

    }




  } catch (err) {
    console.error('Failed to mark notification as read:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update notification'
    });
  }
}


//unread count

export const unreadCount = async (req, res) => {


  console.log("unread count route hitted");

  var { department, userId } = req.body
  console.log("the department and the id are: ", department, userId);

  try {
    // Fetch unread notifications
    const result = await db.query(
      `SELECT 
      n.id, 
      n.message, 
      n.department, 
      n.created_at
      FROM notifications n
      LEFT JOIN user_notifications un 
      ON n.id = un.notification_id AND un.user_id = $1
      WHERE (n.department = $2 OR n.department = 'general')
      AND (un.is_read IS NULL OR un.is_read = FALSE)
      ORDER BY n.created_at DESC`,
      [userId, department]
    );


    const unreadDetails = result.rows 
    console.log("the result of the unread count is ", unreadDetails);
    
    var unreadCount = parseInt(result.rows.length)


    console.log("result is :", result.rows.length);

    res.status(200).json({ message: "ok", unreadCount: unreadCount, unreadDetails:unreadDetails })


    // const unreadCount = parseInt(result[0].unreadCount, 10); // Use the correct case here
    // console.log("this is the unread route, ", unreadCount);

    // // Ensure that the result is an array, and if so, respond with the unread count
    // if (result && result.length > 0) {
    //   res.json({ unreadCount }); // Consistent key name here
    // } else {
    //   res.json({ unreadCount: 0 });
    // }
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

}