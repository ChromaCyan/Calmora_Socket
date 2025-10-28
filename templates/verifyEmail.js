const otpEmailTemplate = (firstName, otp) => `
  <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 40px 20px;">
    <div style="max-width: 600px; background: #fff; margin: 0 auto; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); text-align: center;">
    <div style="margin-bottom: 30px;">
        <img 
          src="https://xipqovlvavpygfnzjtpg.supabase.co/storage/v1/object/sign/profile-images/Calmora.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80YTAyMDlhYS00NjI2LTRhOTktYTM5Ny1jYzBmZDM2ZWJjNDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9maWxlLWltYWdlcy9DYWxtb3JhLnBuZyIsImlhdCI6MTc1NjkwNTIxNSwiZXhwIjoxNzg4NDQxMjE1fQ.fgcPnsPaGOlVUGU2DdGtMtYjOk40ZDGGM9RTotd_zUU"
          alt="Calmora Logo"
          style="width: 150px; display: block; margin: 0 auto;"
        />
      </div>
      <h2 style="color: #0d6efd;">Email Verification OTP</h2>
      <p style="font-size: 16px; color: #495057;">Hi <strong>${firstName}</strong>,</p>
      <p style="font-size: 16px; color: #495057;">
        You requested an otp for your account creation in Calmora.
      </p>

      <div style="margin: 30px 0; font-size: 28px; font-weight: bold; color: #0d6efd;">${otp}</div>

      <p style="font-size: 14px; color: #6c757d;">
        This OTP is valid for 5 minutes. If you did not request a an otp, you can safely ignore this email.
      </p>

      <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
        - Calmora Team
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #adb5bd;">
      Need help? Contact us at <a href="mailto:support@calmora.com" style="color: #6c757d;">support@calmora.com</a>
    </div>
  </div>
`;

module.exports = otpEmailTemplate;
