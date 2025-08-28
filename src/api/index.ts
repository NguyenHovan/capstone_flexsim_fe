export const API = {
  REGISTER: "/api/account/register-admin-account",
  //ACCOUNT
  GET_ALL_ACCOUNT: "/api/account/get_all",
  GET_ALL_ACCOUNT_ORGID: "api/account/get_all_by_org",
  LOGIN: "/api/account/login",
  FORGOT_PASSWORD: "/api/account/forgot_password",
  RESET_PASSWORD: "/api/account/resest_password",
  CHANGE_PASSWORD: "/api/account/change_password",
  REQUEST_CHANGE_EMAIL: "/api/account/request_change_email",
  UPDATE_ACCOUNT: "/api/account/update_account",
  VERIFY_EMAIL: "/api/account/verify_email",
  CONFIRM_CHANGE_EMAIL: "/api/account/confirm_change_email",
  RESEND_VERIFY: "/api/account/resend_verify",
  GET_ACCOUNT_ID: "/api/account/get_account",
  DELETE_ACCOUNT: "/api/account/delete_account",
  CREATE_ORG_ADMIN: "/api/account/register-organization-admin-account",
  CREATE_INSTRUCTOR: "/api/account/register-instructor-account",
  CREATE_STUDENT: "/api/account/register-student-account",
  BAN_ACCOUNT: "/api/account/ban_account",
  UNBAN_ACCOUNT: "/api/account/unban_account",

  IMPORT_INSTRUCTOR: "/api/account/import-instructors",
  IMPORT_STUDENT: "/api/account/import-students",
  EXPORT_INSTRUCTOR: "/api/account/instructors",
  EXPORT_STUDENT: "/api/account/students",

  //ACCOUNT OF WORKSPACE
  GET_ALL_ACCOUNTOFWORKSPACE:
    "/api/accountOfWorkSpace/get_all_accountOfWorkSpace",
  GET_ACCOUNTOFWORKSPACES_ID: "/api/accountOfWorkSpace/get_accountOfWorkSpace",
  CREATE_ACCOUNTOFWORKSPACE:
    "/api/accountOfWorkSpace/create_accountOfWorkSpace",
  UPDATE_ACCOUNTOFWORKSPACE:
    "/api/accountOfWorkSpace/update_accountOfWorkSpace",
  DELETE_ACCOUNTOFWORKSPACE:
    "/api/accountOfWorkSpace/delete_accountOfWorkSpace",

  //ANSWER
  GET_ALL_ANSWER: "/api/answer/get_all_answer",
  GET_ANSWER_ID: "/api/answer/get_answer",
  CREATE_ANSWER: "/api/answer/create_answer",
  UPDATE_ANSWER: "/api/answer/update_answer",
  DELETE_ANSWER: "/api/answer/delete_answer",

  //COURSE
  GET_ALL_COURSE: "/api/course/get_all",
  GET_ALL_COURSE_ORGID: "/api/course/get_all_by_org",
  GET_COURSE_BY_INSTRUCTOR: "/api/course/my_course",
  GET_COURSE_BY_CATEGORY_ID: "/api/course/get_all_course_by_category",

  GET_COURSE_ID: "/api/course/get_by_id",
  // GET_COURSE_SEARCH: "/api/course/searchCourse",
  CREATE_COURSE: "/api/course/create",
  UPDATE_COURSE: "/api/course/update",
  DELETE_COURSE: "/api/course/delete",

  //COURSE PROGRESS
  GET_ALL_COURSEPROGRESS: "/api/CourseProgress/get_all_courseProgress",
  GET_COURSEPROGRESS_ID: "/api/CourseProgress/get_courseProgress",
  CREATE_COURSEPROGRESS: "/api/CourseProgress/create_courseProgress",
  UPDATE_COURSEPROGRESS: "/api/CourseProgress/update_courseProgress",
  DELETE_COURSEPROGRESS: "/api/CourseProgress/delete_courseProgress",

  //COURSE-PROGRESS
  GET_MY_COURSE_PROGRESS: "/api/courseProgress/get_my_courseProgress",

  //CLASSES
  GET_ALL_CLASS: "/api/class/get_all_class",
  GET_CLASS_ID: "/api/class/get_class",
  CREATE_CLASS: "/api/class/create_class",
  UPDATE_CLASS: "/api/class/update_class",
  DELETE_CLASS: "/api/class/delete_class",
  GET_CLASS_BY_COURSE: "/api/class/get_classes_by_course",
  GET_CLASS_BY_STUDENT: "/api/class/get_classes_by_student",

  //TOPIC
  GET_ALL_TOPIC: "/api/topic/get_all_topic",
  GET_TOPIC_ID: "/api/topic/get_topic",
  GET_TOPIC_COURSE: "/api/topic/by-course",
  CREATE_TOPIC: "/api/topic/create_topic",
  UPDATE_TOPIC: "/api/topic/update_topic",
  DELETE_TOPIC: "/api/topic/delete_topic",
  GET_TOPIC_BY_COURSE: "/api/topic/by-course",

  //SCENE
  GET_ALL_SCENE: "/api/scene/get_all_scene",
  GET_ALL_SCENE_ORGID: "/api/scene/get_all_by_org",
  GET_SCENE_ID: "/api/scene/get_scene",
  CREATE_SCENE: "/api/scene/create_scene",
  UPDATE_SCENE: "/api/scene/update_scene",
  DELETE_SCENE: "/api/scene/delete_scene",

  //SCENE OF WORKSPACE
  GET_ALL_SCENE_OF_WORKSPACE: "/api/sceneOfWorkSpace/get_all_sceneOfWorkSpace",
  GET_SCENEOFWORKSPACE_ID: "/api/sceneOfWorkSpace/get_sceneOfWorkSpace",
  CREATE_SCENEOFWORKSPACE: "/api/sceneOfWorkSpace/create_sceneOfWorkSpace",
  UPDATE_SCENEOFWORKSPACE: "/api/sceneOfWorkSpace/update_sceneOfWorkSpace",
  DELETE_SCENEOFWORKSPACE: "/api/sceneOfWorkSpace/delete_sceneOfWorkSpace",

  //SCENARIO
  GET_ALL_SCENARIO: "/api/scenario/get_all_scenario",
  GET_ALL_SCENARIO_ORGID: "/api/scenario/get_all_by_org",
  GET_SCENARIO_ID: "/api/scenario/get_scenario",
  CREATE_SCENARIO: "/api/scenario/create_scenario",
  UPDATE_SCENARIO: "/api/scenario/update_scenario",
  DELETE_SCENARIO: "/api/scenario/delete_scenario",

  //QUIZ
  GET_ALL_QUIZ: "/api/quiz/get_all_quiz",
  GET_QUIZ_ID: "/api/quiz/get_quiz",
  GET_ALL_QUESTION_QUIZ: "/api/quiz/questions",
  CREATE_NEW_QUIZ: "/api/quiz/create_quiz",
  CREATE_FULL_QUIZ: "/api/quiz/create_full_quiz",
  UPDATE_QUIZ: "/api/quiz/update-full_quiz",
  DELETE_QUIZ: "/api/quiz/delete_quiz",
  GET_QUIZ_LESSON: "/api/quiz/by-lesson",
  GET_FULL_QUIZ_ID: "/api/quiz/get_full_quiz",
  CREATE_QUESTIONS: "/api/quiz/questions",
  REVIEW_QUIZ: "/api/quiz/review_quiz",

  //QUIZ SUBMISSION
  SUBMIT_QUIZ: "/api/quizSubmission/submit_quiz",
  GET_QUIZ_SUBMIT_LESSON_BY_QUIZ_ID: "/api/quizSubmission/lesson/",

  //REVIEW
  GET_ALL_REVIEW: "/api/review/get_all_review",
  GET_REVIEW_ID: "/api/review/get_review",
  CREATE_REVIEW: "/api/review/create_review",
  UPDATE_REVIEW: "/api/review/update_review",
  DELETE_REVIEW: "/api/review/delete_review",
  GET_REVIEW_BY_COURSE: "/api/review/course",
  SUBMIT_REVIEW_BY_COURSE: "/api/review",

  //WORKSPACE
  GET_ALL_WORKSPACE: "/api/workspace/get_all_workSpace",
  GET_ALL_WORKSPACE_ORGID: "/api/workspace/get_all_by_org",
  GET_WORKSPACES_ID: "/api/workspace/get_workSpace",
  CREATE_WORKSPACE: "/api/workspace/create_workSpace",
  UPDATE_WORKSPACE: "/api/workspace/update_workSpace",
  DELETE_WORKSPACE: "/api/workspace/delete_workSpace",

  //UPLOAD FILE
  UPLOAD_FILE: "/api/Cloudinary/upload",

  //ORGANIZATION

  GET_ALL_ORGANIZATION: "/api/organization/get_all_organization",
  GET_ORGANIZATION_ID: "/api/organization/get_organization",
  CREATE_ORGANIZATION: "/api/organization/create_organization",
  UPDATE_ORGANIZATION: "/api/organization/update_organization",
  DELETE_ORGANIZATION: "/api/organization/delete_organization",

  // ORDER
  GET_ALL_ORDER: "/api/orders",
  GET_ORDER_ID: "/api/orders",
  DELETE_ORDER: "/api/orders",
  CREATE_ORDER: "/api/orders/create",
  UPDATE_ORDER: "/api/orders/status",

  // SUBCRIPTION PLAND

  GET_ALL_SUBCRIPTION: "/api/subscription-plan/get_all",
  GET_SUBCRIPTION_ID: "/api/subscription-plan/get",
  DELETE_SUBCRIPTION: "/api/subscription-plan/delete",
  CREATE_SUBCRIPTION: "/api/subscription-plan/create",
  UPDATE_SUBCRIPTION: "/api/subscription-plan/update",

  //AUTH
  LOGIN_WITH_GOOGLE: "/api/auth/login_google",

  //CATEGORY
  GET_ALL_CATEGORY: "/api/category/get_all",
  GET_CATEGORY_ID: "/api/category/get",
  CREATE_CATEGORY: "/api/category/create",
  UPDATE_CATEGORY: "/api/category/update",
  DELETE_CATEGORY: "/api/category/delete",

  //CHAT
  CREATE_CHAT: "/chat",

  //EnrollmentRequest
  ENROLLMENT_REQUEST: "/api/enrollmentRequest/create_enrollmentRequest",
  ENROLLMENT_REQUEST_STUDENT: "/api/enrollmentRequest/student",
  GET_ENROLLMENT_REQUEST: "/api/enrollmentRequest/get_all_enrollmentRequest",
  ACCEPT_ENROLLMENT_REQUEST:
    "/api/enrollmentRequest/accepted_enrollmentRequest",
  REJECT_ENROLLMENT_REQUEST:
    "/api/enrollmentRequest/rejected_enrollmentRequest",
  DELETE_ENROLLMENT_REQUEST: "/api/enrollmentRequest/delete_enrollmentRequest",
  GET_STUDENT_ENROLLMENT: "/api/enrollmentRequest/class",
  GET_STUDENT_ENROLLMENT_CLASS_COURSE: "/api/enrollmentRequest/class-course",
  ASSIGN_STUDENT_CLASS: "/api/enrollmentRequest/assign-student-to-class",
  ENROLLMENT_REQUEST_COURSE: "/api/enrollmentRequest/enrolled_requests_pending",

  //LESSON
  GET_ALL_LESSON: "/api/Lesson/get_all_lesson",
  CREATE_LESSON: "/api/Lesson/create_lesson",
  GET_LESSON_ID: "/api/Lesson/get_lesson",
  GET_LESSON_TOPIC_ID: "/api/Lesson/by-topic",
  UPDATE_LESSON: "/api/Lesson/update_lesson",
  DELETE_LESSON: "/api/Lesson/delete_notification",

  //LESSON PROGRESS
  GET_ALL_LESSONPROGRESS: "/api/LessonProgress/get_all_lessonProgress",
  CREATE_LESSONPROGRESS: "/api/LessonProgress/create_lessonProgress",
  GET_LESSONPROGRESS_ID: "/api/LessonProgress/get_lessonProgress",
  UPDATE_LESSONPROGRESS: "/api/LessonProgress/update_lessonProgress",
  UPDATE_LESSONPROGRESS_LESSON: "/api/LessonProgress/update_lesson",
  DELETE_LESSONPROGRESS: "/api/LessonProgress/delete_lessonProgress",

  //Lesson Submission
  SUBMIT_LESSON_SUBMISSION: "/api/lessonSubmission/submit-lesson",
  GET_LESSON_SUBMISSION: "/api/lessonSubmission/lesson",
  GRADE_LESSON_SUBMISSION: "/api/lessonSubmission/grade-submission",

  //NOTIFICATION
  GET_ALL_NOTIFICATION: "/api/notification/get_all_notification",
  GET_NOTIFICATION_ID: "/api/notification/get_notification",
  CREATE_NOTIFICATION: "/api/notification/create_notification",
  UPDATE_NOTIFICATION: "/api/notification/update_notification",
  DELETE_NOTIFICATION: "/api/notification/delete_notification",

  //PAYMENT

  CREATE_PAYMENT_BY_ORDER_ID: (orderId: string) =>
    `/api/payment/create-payment/${orderId}`,
  UPDATE_PAYMENT: "/api/payment/update",
  GET_ALL_PAYMENT: "/api/payment/get_all_payment",
  GET_PAYMENT_ID: "/api/payment/get_payment",

  //QUESTION
  GET_ALL_QUESTION: "/api/question/get_all_question",
  GET_QUESTION_ID: "/api/question/get_question",
  CREATE_QUESTION: "/api/question/create_question",
  UPDATE_QUESTION: "/api/question/update_question",
  DELETE_QUESTION: "/api/question/delete_question",

  //QUIZ SUBMIT
  SUBMIT_QUIZ_ANSWER: "/api/quizSubmission/submit_quiz",

  GET_LESSON_TOPIC: "/api/lesson/by-topic",
  GET_LESSON_QUIZZ: "/api/lesson",
  DELETE_LESSON_QUIZZ: "/api/lesson/delete_lesson",
  UPDATE_LESSON_QUIZZ: "/api/lesson/update_lesson",

  //Lesson progress
  UPDATE_LESSON_PROGRESS: "/api/lessonProgress/update-lesson-progress",

  //certificate
  GET_MY_CERTIFICATE: "/api/certificate/my_certificates",
  GET_CERTIFICATE_BY_COURSE_AND_ACCOUNT: "/api/certificate/my_certificate",
};
