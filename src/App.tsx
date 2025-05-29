import "./globals.css";

import {
  AdventureManagement,
  AdventuresList,
  CreateAdventure,
  EditAdventure,
} from "./_root/pages/adventures";
import {
  AllUsers,
  CreatePost,
  EditPost,
  Explore,
  Home,
  PostDetails,
  Profile,
  Saved,
  UpdateProfile,
} from "./_root/pages";
import ProtectedRoute, { AdminRoute } from "./components/shared/ProtectedRoute";
import { Route, Routes } from "react-router-dom";

import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import TagPage from "./_root/pages/TagPage";
import { Toaster } from "./components/ui/toaster";

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/** Public Routes  */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>
        
        {/** Private Routes  */}
        <Route element={
          <ProtectedRoute requireAuth>
            <RootLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/tag/:tag" element={<TagPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-users" element={<AllUsers />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          
          {/** ROTAS PROTEGIDAS DE AVENTURAS - APENAS ADMINS */}
          <Route path="/adventures" element={
            <AdminRoute>
              <AdventuresList />
            </AdminRoute>
          } />
          <Route path="/adventures/create" element={
            <AdminRoute>
              <CreateAdventure />
            </AdminRoute>
          } />
          <Route path="/adventures/:id/edit" element={
            <AdminRoute>
              <EditAdventure />
            </AdminRoute>
          } />
          <Route path="/adventures/:id/manage" element={
            <AdminRoute>
              <AdventureManagement />
            </AdminRoute>
          } />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;