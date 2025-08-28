import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/Login";
// import SignUpPage from "../pages/Signup/Signup";
import ForgotPasswordPage from "../pages/ForgotPassword/ForgotPassword";
import VerifyCodePage from "../pages/VerifyCode/VerifyCode";
import LayoutMain from "../layouts/Student";
import HomePage from "../pages/Home/Home";
import Contact from "../pages/Contact/Contact";
import NewPasswordPage from "../pages/NewPassword/NewPassword";
import InstructorLayout from "../layouts/Instructor/InstructorLayout";
import Overview from "../pages/Instructor/Overview";
import CourseManagement from "../pages/Instructor/Course-manage/Course-manage";
import ManageClass from "../pages/Instructor/Class-manage/Class-manage";
import TopicManagement from "../pages/Instructor/Topic-manage/TopicManagement";
import SceneManagement from "../pages/Instructor/Scene-manage/SceneManagement";
import QuizManagement from "../pages/Instructor/Quiz-manage/QuizManagement";
import AdminLayout from "../layouts/Admin/AdminLayout";
import AdminOverview from "../pages/Admin/Overview";
import OrganizationManager from "../pages/Admin/Manager Organization/OrganizationManager";
import UserManager from "../pages/Admin/Manager User/UserManager";
import WorkspaceManager from "../pages/Admin/Manager Workspace/WorkspaceManager";
import ReviewManagement from "../pages/Instructor/Review-manage/ReviewManagement";
import ProfileLayout from "../pages/Profile";
import MyCourse from "../pages/Profile/MyCourse";
import MyClass from "../pages/Profile/MyClass";
import Setting from "../pages/Profile/Setting";
import About from "../pages/Profile/About";
import CourseList from "../pages/CourseList/CourseList";
import CourseDetail from "../pages/CourseDetail/CourseDetail";
import OrganizationAdminLayout from "../layouts/Organization Admin/OragnizarionAdminLayout";
import OrganizationAdminOverview from "../pages/OrganizationAdmin/Overview";
import WorkspaceOrganization from "../pages/OrganizationAdmin/Workspace Manager/WorkspaceOrganization";
import UserOrganization from "../pages/OrganizationAdmin/User Manager/UserOrganization";
import PrivateRoute from "./PrivateRoute";
// import ClassManagerOrgAdmin from "../pages/OrganizationAdmin/Class Manager/ClassOrganization";
import LessonManagement from "../pages/Instructor/Manage-Lesson/LessonManagement";
import EnrollManage from "../pages/Instructor/Manage-Enrollment-Request/EnrollManage";
import SubscriptionPlanAdmin from "../pages/Admin/Subcription Plan/SubcriptionPlan";
import OrderOrganization from "../pages/OrganizationAdmin/Order Manager/OrderMananger";
import PaymentSuccess from "../pages/Payment/PaymentSuccess";
import PaymentFail from "../pages/Payment/PaymentFailure";
import OrderAdmin from "../pages/Admin/Order Manager/OrderAdmin";
import AddStudentPage from "../pages/Instructor/Add-student/Add-student";
import MyCertificate from "../pages/MyCertificate/MyCertificate";
import ContentCourse from "../pages/Instructor/Course-manage/ContentCourse";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";
import OrgAdminProfile from "../pages/OrganizationAdmin/Profile/OrgAdminProfile";
import OrgAdminSubscriptionPlans from "../pages/OrganizationAdmin/Subcription/Subcription";
import QuizDetail from "../pages/Instructor/Quiz-manage/Quiz-Detail";
import TopicDetail from "../pages/TopicDetail/TopicDetail";
import QuizPage from "../pages/QuizPage";
import ScenarioManager from "../pages/Instructor/Manage-Scenario";
import QuizReview from "../pages/QuizReview";
import ClassSubmissionsTable from "../pages/Instructor/LessonSubmission";

const MainRoute = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/signup" element={<SignUpPage />} /> */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-code" element={<VerifyCodePage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />

      {/* Guest/Student layout */}
      <Route element={<LayoutMain />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
        <Route path="/course-list" element={<CourseList />} />
        <Route path="/course-detail/:id" element={<CourseDetail />} />
        <Route path="/quiz-test/:id" element={<QuizPage />} />
        <Route path="/topic-detail/:id" element={<TopicDetail />} />
        <Route path="/quiz-review/:id" element={<QuizReview />} />
        <Route
          path="/profile"
          element={
            <ProfileLayout>
              <About />
            </ProfileLayout>
          }
        />
        <Route
          path="/my-course"
          element={
            <ProfileLayout>
              <MyCourse />
            </ProfileLayout>
          }
        />
        <Route
          path="/my-class"
          element={
            <ProfileLayout>
              <MyClass />
            </ProfileLayout>
          }
        />
        <Route
          path="/my-certificate"
          element={
            <ProfileLayout>
              <MyCertificate />
            </ProfileLayout>
          }
        />
        <Route
          path="/setting"
          element={
            <ProfileLayout>
              <Setting />
            </ProfileLayout>
          }
        />
      </Route>

      {/* Admin routes */}
      <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route
            path="organization-manager"
            element={<OrganizationManager />}
          />
          <Route path="user-manager" element={<UserManager />} />
          <Route path="workspace-manager" element={<WorkspaceManager />} />
          <Route
            path="subscriptionPlan-manager"
            element={<SubscriptionPlanAdmin />}
          />
          <Route path="order-manager" element={<OrderAdmin />} />
          <Route path="admin-profile" element={<AdminProfile />} />
        </Route>
      </Route>

      {/* Organization Admin routes */}
      <Route element={<PrivateRoute allowedRoles={["organizationAdmin"]} />}>
        <Route path="/organizationAdmin" element={<OrganizationAdminLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OrganizationAdminOverview />} />
          <Route path="user-manager" element={<UserOrganization />} />
          <Route path="workspace-manager" element={<WorkspaceOrganization />} />
          <Route path="subscription" element={<OrgAdminSubscriptionPlans />} />
          <Route path="order-manager" element={<OrderOrganization />} />
          <Route path="orgAdmin-profile" element={<OrgAdminProfile />} />
        </Route>
      </Route>

      {/* Instructor routes */}
      <Route element={<PrivateRoute allowedRoles={["instructor", "admin"]} />}>
        <Route element={<InstructorLayout />}>
          <Route path="/instructor" element={<Overview />} />
          <Route path="/instructor-course" element={<CourseManagement />} />
          <Route
            path="/instructor-course/detail/:id"
            element={<ContentCourse />}
          />
          <Route path="/instructor-class" element={<ManageClass />} />
          <Route
            path="/instructor-class/add-student/:id/:courseId"
            element={<AddStudentPage />}
          />
          <Route path="/instructor-topic" element={<TopicManagement />} />
          <Route path="/instructor-scene" element={<SceneManagement />} />
          <Route path="/instructor-scenario" element={<ScenarioManager />} />
          <Route
            path="/instructor-quiz/:lessonId"
            element={<QuizManagement />}
          />
          <Route path="/instructor-review" element={<ReviewManagement />} />
          <Route path="/instructor-lesson" element={<LessonManagement />} />
          <Route path="/instructor-enroll-request" element={<EnrollManage />} />
          <Route path="/instructor-quiz-detail/:id" element={<QuizDetail />} />
          <Route
            path="/instructor-lesson-submission/:id"
            element={<ClassSubmissionsTable />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default MainRoute;
