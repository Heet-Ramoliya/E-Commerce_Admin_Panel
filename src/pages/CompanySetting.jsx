import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../Config/Firebase";

const CompanySetting = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState({
    company_name: "",
    address: "",
    contact_information: { phone: "", email: "" },
    gst_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [id, setId] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "company"),
      (snapshot) => {
        const companyData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (companyData.length > 0) {
          const { company_name, address, contact_information, gst_number } =
            companyData[0];
          setId(companyData[0].id);
          setCompany({
            company_name: company_name || "",
            address: address || "",
            contact_information: {
              phone: contact_information?.phone || "",
              email: contact_information?.email || "",
            },
            gst_number: gst_number || "",
          });
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to fetch company details.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const updateInput = (e) => {
    const { name, value } = e.target;
    if (name.includes("contact_information.")) {
      const field = name.split(".")[1];
      setCompany({
        ...company,
        contact_information: { ...company.contact_information, [field]: value },
      });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const saveCompany = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!company.company_name || !company.contact_information.email) {
      toast.error("Please fill required fields: Company Name and Email");
      setLoading(false);
      return;
    }

    try {
      const companyRef = doc(db, "company", id);
      await setDoc(
        companyRef,
        {
          company_name: company.company_name,
          address: company.address,
          contact_information: {
            phone: company.contact_information.phone,
            email: company.contact_information.email,
          },
          gst_number: company.gst_number,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      toast.success("Company details updated successfully!");
      setIsEditing(false);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update company details.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Company Profile
          </h1>
        </div>

        {/* Read-Only View */}
        {!isEditing ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white">
                {company.company_name || "Company Name Not Set"}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Address
                  </h3>
                  <p className="mt-2 text-lg text-gray-900 dark:text-gray-100 whitespace-pre-line">
                    {company.address || "Not provided"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Contact
                  </h3>
                  <p className="mt-2 text-lg text-gray-900 dark:text-gray-100">
                    {company.contact_information.phone || "No phone number"}
                  </p>
                  <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                    {company.contact_information.email || "No email"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  GST Number
                </h3>
                <p className="mt-2 text-lg text-gray-900 dark:text-gray-100">
                  {company.gst_number || "Not provided"}
                </p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
              >
                <FiEdit className="h-5 w-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        ) : (
          /* Edit Form */
          <form
            onSubmit={saveCompany}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-8"
          >
            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={company.company_name}
                  onChange={updateInput}
                  required
                  placeholder="Enter company name"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={company.address}
                  onChange={updateInput}
                  placeholder="Enter company address"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Phone and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="contact_information.phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact_information.phone"
                    name="contact_information.phone"
                    type="text"
                    value={company.contact_information.phone}
                    onChange={updateInput}
                    placeholder="Enter phone number"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact_information.email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact_information.email"
                    name="contact_information.email"
                    type="email"
                    value={company.contact_information.email}
                    onChange={updateInput}
                    required
                    placeholder="Enter email address"
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* GST Number */}
              <div>
                <label
                  htmlFor="gst_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  GST Number
                </label>
                <input
                  id="gst_number"
                  name="gst_number"
                  type="text"
                  value={company.gst_number}
                  onChange={updateInput}
                  placeholder="Enter GST number"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-5 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
              >
                <FiSave className="h-5 w-5" />
                <span>{loading ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompanySetting;
