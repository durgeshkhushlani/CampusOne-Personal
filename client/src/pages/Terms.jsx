import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Lock, FileText, HelpCircle } from "lucide-react";

export default function Terms() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAF5E6",
      color: "#5C4033",
      fontFamily: "Inter, sans-serif",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "#FFFFFF",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        padding: "40px",
      }}>
        {/* Back to Login */}
        <Link to="/login" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#8C2E2E",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "30px",
        }}>
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#2C3E50",
            marginBottom: "10px",
          }}>
            Terms & Policies
          </h1>
          <p style={{ fontSize: "14px", color: "#A6907A" }}>
            Last Updated: April 2026 | Dhirubhai Ambani University
          </p>
        </div>

        {/* Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          
          {/* Section 1 */}
          <section style={{ display: "flex", gap: "20px" }}>
            <div style={{
              background: "rgba(140, 46, 46, 0.1)",
              color: "#8C2E2E",
              borderRadius: "12px",
              padding: "12px",
              height: "fit-content",
            }}>
              <Shield size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#2C3E50", marginBottom: "10px" }}>
                1. Acceptable Use Policy
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#5C4033" }}>
                The CampusOne portal is intended strictly for academic and administrative purposes. Users must not use the platform for any commercial activities, unauthorized data collection, or sharing of inappropriate content. Any violation may result in immediate suspension of access and disciplinary action.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{ display: "flex", gap: "20px" }}>
            <div style={{
              background: "rgba(140, 46, 46, 0.1)",
              color: "#8C2E2E",
              borderRadius: "12px",
              padding: "12px",
              height: "fit-content",
            }}>
              <Lock size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#2C3E50", marginBottom: "10px" }}>
                2. Privacy & Data Security
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#5C4033" }}>
                We take your data privacy seriously. Personal information, academic records, and attendance data are stored securely and accessed only by authorized personnel. Users are responsible for maintaining the confidentiality of their login credentials. Do not share your password with anyone.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{ display: "flex", gap: "20px" }}>
            <div style={{
              background: "rgba(140, 46, 46, 0.1)",
              color: "#8C2E2E",
              borderRadius: "12px",
              padding: "12px",
              height: "fit-content",
            }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#2C3E50", marginBottom: "10px" }}>
                3. Academic Integrity
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#5C4033" }}>
                All academic work submitted through CampusOne, including assignments, exams, and code submissions, must adhere to the University's Academic Integrity Code. Plagiarism, cheating, or unauthorized collaboration will be flagged and dealt with according to university norms.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section style={{ display: "flex", gap: "20px" }}>
            <div style={{
              background: "rgba(140, 46, 46, 0.1)",
              color: "#8C2E2E",
              borderRadius: "12px",
              padding: "12px",
              height: "fit-content",
            }}>
              <HelpCircle size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#2C3E50", marginBottom: "10px" }}>
                4. Support & Contact
              </h2>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#5C4033" }}>
                If you encounter any technical issues or have concerns regarding your account, please contact the IT Support Helpdesk at <strong>info@campusone.edu</strong> or call <strong>+91 79847 04174</strong>.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #E8DCC4",
          marginTop: "40px",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "12px",
          color: "#A6907A",
        }}>
          &copy; 2026 Dhirubhai Ambani University. All rights reserved.
        </div>

      </div>
    </div>
  );
}
