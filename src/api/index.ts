export const API = {
  //ACCOUNT
  GET_ALL_ACCOUNT: "/api/account/get_all",
  REGISTER: "/api/account/SignUp",
  LOGIN: "/api/Account/Login",
  FORGOT_PASSWORD: "/api/account/forgot_password",
  CHANGE_PASSWORD: "/api/account/change_password",
  UPDATE_ACCOUNT: "/api/account/update_account",
  VERIFY_EMAIL: "/api/Account/VerifyEmail",
  GET_ACCOUNT_ID: "/api/account/get_account",
  DELETE_ACCOUNT: "/api/account/delete_account",
  CREATE_ORG_ADMIN: "/api/account/register-organization-admin-account",
  CREATE_INSTRUCTOR: "/api/account/register-instructor-account",
  CREATE_STUDENT: "/api/account/register-student-account",
  BAN_ACCOUNT: "/api/account/ban_account",
  UNBAN_ACCOUNT: "/api/account/unban_account",

  //COURSE
  GET_ALL_COURSE: "/api/course/get_all",
  GET_COURSE_ID: "/api/course/get_by_id",
  GET_COURSE_SEARCH: "/api/Course/SearchCourse",
  CREATE_COURSE: "/api/course/create",
  UPDATE_COURSE: "/api/course/update",
  DELETE_COURSE: "/api/course/delete",

  //CLASSES
  GET_ALL_CLASS: "/api/class/get_all_class",
  GET_CLASS_ID: "/api/class/get_class",
  CREATE_CLASS: "/api/class/create_class",
  UPDATE_CLASS: "/api/class/update_class",
  DELETE_CLASS: "/api/class/delete_class",

  //TOPIC
  GET_ALL_TOPIC: "/api/topic/get_all_topic",
  GET_TOPIC_ID: "/api/topic/get_topic",
  CREATE_TOPIC: "/api/topic/create_topic",
  UPDATE_TOPIC: "/api/topic/update_topic",
  DELETE_TOPIC: "/api/topic/delete_topic",

  //SCENE
  GET_ALL_SCENE: "/api/scene/get_all_scene",
  GET_SCENE_ID: "/api/scene/get_scene",
  CREATE_SCENE: "/api/scene/create_scene",
  UPDATE_SCENE: "/api/scene/update_scene",
  DELETE_SCENE: "/api/scene/delete_scene",

  //SCENARIO
  GET_ALL_SCENARIO: "/api/scenario/get_all_scenario",

  //QUIZ
  GET_ALL_QUIZ: "/api/quiz/get_all_quiz",
  GET_QUIZ_ID: "/api/quiz/get_quiz",
  CREATE_FULL_QUIZ: "/api/quiz/create_full_quiz",
  UPDATE_QUIZ: "/api/quiz/update_quiz",
  DELETE_QUIZ: "/api/quiz/delete_quiz",

  //REVIEW
  GET_ALL_REVIEW: "/api/review/get_all_review",
  GET_REVIEW_ID: "/api/review/get_review",
  CREATE_REVIEW: "/api/review/create_review",
  UPDATE_REVIEW: "/api/review/update_review",
  DELETE_REVIEW: "/api/review/delete_review",
  //WORKSPACE
  GET_ALL_WORKSPACE: "/api/workspace/get_all_workSpace",
  GET_WORKSPACES_BY_ID: "/api/workspace/get_workSpace",
  CREATE_WORKSPACE: "/api/workspace/create_workSpace",
  UPDATE_WORKSPACE: "/api/workspace/update_workSpace",
  DELETE_WORKSPACE: "/api/workspace/delete_workSpace",

  //UPLOAD FILE
  UPLOAD_FILE: "/api/Cloudinary/image",

  //ADMIN

  GET_ALL_ORGANIZATION: "/api/organization/get_all_organization",
  GET_ORGANIZATION_ID: "/api/organization/get_organization",
  CREATE_ORGANIZATION: "/api/organization/create_organization",
  UPDATE_ORGANIZATION: "/api/organization/update_organization",
  DELETE_ORGANIZATION: "/api/organization/delete_organization",

  // ORDER
  GET_ALL_ORDER: "/api/orders",
  GET_ORDER_BY_ID: "/api/orders",
  DELETE_ORDER: "/api/orders",
  CREATE_ORDER: "/api/orders",
  UPDATE_ORDER: "/api/orders/status",

  // SUBCRIPTION PLAND

  GET_ALL_SUBCRIPTION: "/api/subscription-plan/get_all",
  GET_SUBCRIPTION_BY_ID: "/api/subscription-plan/get",
  DELETE_SUBCRIPTION: "/api/subscription-plan/delete",
  CREATE_SUBCRIPTION: "/api/subscription-plan/create",
  UPDATE_SUBCRIPTION: "/api/subscription-plan/update",

  //AUTH

  //CATEGORY
  // GET_ALL_CATEGORY: "/api/category/get_all_category",

  GET_ALL_CATEGORY: "/api/category/get_all",

  //EnrollmentRequest
  ENROLLMENT_REQUEST: "/api/enrollmentRequest/create_enrollmentRequest",
  ENROLLMENT_REQUEST_STUDENT: "/api/enrollmentRequest/student",
  GET_ENROLLMENT_REQUEST: "/api/enrollmentRequest/get_all_enrollmentRequest",
  ACCEPT_ENROLLMENT_REQUEST: "/api/enrollmentRequest/update_enrollmentRequest",
  DELETE_ENROLLMENT_REQUEST: "/api/enrollmentRequest/delete_enrollmentRequest",

  //LESSON
  GET_ALL_LESSON: "/api/Lesson/get_all_lesson",
  CREATE_LESSON: "/api/Lesson/create_lesson",
};
