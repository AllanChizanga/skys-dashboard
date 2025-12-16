import React, { useState } from 'react';
import { useGetUserQuery } from '../../api/usersApiSlice';
import { useGetRegistrationStatusesQuery, useEditRegistrationStatusMutation } from '../../api/registrationStatusApiSlice';
import { useGetIdDocumentsQuery } from '../../api/idDocumentsApiSlice';
import { useGetResultDocumentsQuery } from '../../api/resultDocumentsApiSlice';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Modal from 'react-bootstrap/Modal';
import { useSelector } from 'react-redux';
import { programsApiSlice, scholarshipsApiSlice, acceptanceLetterConfigApiSlice } from '../../api/apiSlice';
import { useEditUserMutation } from '../../api/usersApiSlice';
import AcceptanceLetterConfigForm from '../AcceptanceLetterConfigForm';
import { extractYearFromIntake, formatIntakeFromDate } from '../../utils/intake';

const { useGetProgramsQuery } = programsApiSlice;
const { useGetScholarshipsQuery } = scholarshipsApiSlice;
const { useGetAcceptanceLetterConfigQuery } = acceptanceLetterConfigApiSlice;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

// AcceptanceLetterPDF component for preview and PDF generation
const AcceptanceLetterPDF = React.forwardRef(({ letterData, extraCosts = [], configOverrides = {} }, ref) => (
  <div ref={ref} className="acceptance-letter-root" style={{ 
    background: '#fff', 
    color: '#333', 
    padding: '40px 50px', 
    maxWidth: '800px', 
    margin: '0 auto',
    fontFamily: 'Georgia, "Times New Roman", serif',
    lineHeight: 1.6,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    borderRadius: '8px'
  }}>
    <style>{`
      /* Ensure table headers repeat and rows don't break across pages */
    @media print {
  table { page-break-inside: auto; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  /* Utility class to force a new page before the element */
  .force-page-break { page-break-before: always; break-before: always; }
  /* Avoid breaking the contents of this element across pages */
  .avoid-break { page-break-inside: avoid; break-inside: avoid; }
  /* Compact print layout to help sections fit on pages */
  .acceptance-letter-root { padding: 18px 22px !important; max-width: 780px !important; }
  .acceptance-letter-root img { max-width: 140px !important; }
  .acceptance-letter-root .acceptance-letter-container { font-size: 13px !important; }
  .acceptance-letter-root h3, .acceptance-letter-root h4 { font-size: 14px !important; }
  .acceptance-letter-root table { font-size: 13px !important; }
  .acceptance-letter-root td, .acceptance-letter-root th { padding: 8px 10px !important; }
  .acceptance-letter-root p { font-size: 13px !important; margin: 0 0 12px 0 !important; }
    }
      /* Prevent overly wide content and ensure it fits A4 with margins */
      .acceptance-letter-container { width: 100%; box-sizing: border-box; }
      .acceptance-letter-container table { width: 100%; table-layout: auto; border-collapse: collapse; }
      .acceptance-letter-container td, .acceptance-letter-container th { word-break: break-word; }
    `}</style>
    {/* Header with Logo */}
    <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #1a237e', paddingBottom: '20px' }}>
      <img 
        src="/skies_logo.jpg" 
        alt="Skies UniConnect Logo" 
        style={{ 
          maxWidth: '200px', 
          height: 'auto',
          marginBottom: '15px'
        }} 
      />
      <div style={{ 
        fontSize: '14px', 
        color: '#666',
        lineHeight: 1.4
      }}>
        <strong>Office 3, Flexworks first floor, Meikles Building</strong><br />
        Corner RG Mugabe &amp; Orr Street, Harare, Zimbabwe<br />
        <span style={{ color: '#1a237e' }}>
          admissions@skiesuniconnect.com &nbsp;|&nbsp; +263710779145 &nbsp;|&nbsp; +918699047287
        </span><br />
        <span style={{ color: '#1a237e', fontWeight: 'bold', fontSize: '16px' }}>
          The most reliable education consultancy in Zimbabwe
        </span><br />
        <a href="https://www.skiesuniconnect.com" style={{ 
          color: '#1a237e', 
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          www.skiesuniconnect.com
        </a>
      </div>
    </div>

    {/* Date and Reference */}
    <div style={{ 
      textAlign: 'right', 
      marginBottom: '25px',
      fontSize: '14px',
      color: '#555'
    }}>
      <div><strong>Date:</strong> {letterData.date}</div>
      <div><strong>Reference:</strong> {letterData.app_id}</div>
    </div>

    {/* Main Title */}
    <div style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      margin: '30px 0 25px 0', 
      color: '#1a237e',
      textAlign: 'center',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: '15px'
    }}>
      ACCEPTANCE LETTER
    </div>
    <div style={{ 
      fontSize: '18px', 
      fontWeight: 'bold', 
      marginBottom: '25px', 
      color: '#1a237e',
      textAlign: 'center'
    }}>
      SKIES Uni-Connect Scholarship Program {letterData.class_year || new Date().getFullYear()}
    </div>

    {/* Main Content */}
  <div className="acceptance-letter-container" style={{ 
      marginBottom: '25px',
      fontSize: '15px',
      textAlign: 'justify'
    }}>
      <p style={{ marginBottom: '20px' }}>
        Dear <strong>{capitalizeWords(letterData.full_name)}</strong>,
      </p>
      <p style={{ marginBottom: '20px' }}>
  Congratulations! Our Education Committee has reviewed your application and we are delighted to inform you that you have successfully passed our eligibility assessment. We are pleased to offer you admission to the <strong>Class of {letterData.class_year || new Date().getFullYear()}</strong> under the SKIES Uni-Connect scholarship program.
      </p>
      <p style={{ marginBottom: '20px' }}>
        The committee was thoroughly impressed with your application and academic potential. After careful consideration of your eligibility interview, we are pleased to offer you admission to <strong>{letterData.program}</strong> as applied for. We are excited to inform you that you have been awarded a <strong>{letterData.scholarship}% scholarship</strong> to pursue this course at one of our partner institutions.
      </p>
      <p style={{ marginBottom: '25px' }}>
        We look forward to welcoming you to our academic community and supporting you throughout your educational journey.
      </p>
    </div>

    {/* Student Details Table */}
  <div className="force-page-break avoid-break" style={{ marginBottom: '30px', pageBreakBefore: 'always', breakBefore: 'always', position: 'relative' }}>
      {/* Stamp moved to signature section */}

      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        color: '#1a237e', 
        marginBottom: '15px',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px'
      }}>
        STUDENT DETAILS
      </h3>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        border: '2px solid #1a237e',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, Helvetica, sans-serif' // Use professional sans-serif for numbers
      }}>
        <tbody>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e', 
              width: '35%',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              FULL NAME
            </td>
            <td style={{ 
              padding: '12px 15px', 
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {capitalizeWords(letterData.full_name)}
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              INTAKE
            </td>
            <td style={{ 
              padding: '12px 15px',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {letterData.intake}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              PROGRAM
            </td>
            <td style={{ 
              padding: '12px 15px',
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {letterData.program}
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              DURATION
            </td>
            <td style={{ 
              padding: '12px 15px',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {letterData.duration}
            </td>
          </tr>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              TUITION FEE
            </td>
            <td style={{ 
              padding: '12px 15px',
              borderBottom: '1px solid #dee2e6',
              fontWeight: '500',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {letterData.tuition}
            </td>
          </tr>
          <tr>
            <td style={{ 
              padding: '12px 15px', 
              fontWeight: 'bold', 
              color: '#1a237e',
              borderRight: '1px solid #dee2e6',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              ADMISSION FEE
            </td>
            <td style={{ 
              padding: '12px 15px',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {letterData.admission_fee}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Additional Information on Student Details page */}
      {extraCosts.length > 0 && (
        <div style={{ 
          marginTop: '25px',
          marginBottom: '25px',
          padding: '15px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          border: '1px solid #bbdefb'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#1a237e', 
            marginBottom: '15px'
          }}>
            ADDITIONAL COSTS
          </h4>
          <div style={{ fontSize: '14px' }}>
            {extraCosts.map((cost, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}><strong>{cost.label}:</strong> {cost.value}</div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Policy on Student Details page */}
      <div style={{ 
        marginTop: '25px',
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #1a237e'
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1a237e', 
          marginBottom: '15px'
        }}>
          PAYMENT POLICY
        </h4>
        {configOverrides.payment_policy ? (
          <div style={{ fontSize: '14px', whiteSpace: 'pre-line' }}>{configOverrides.payment_policy}</div>
        ) : (
          <ul style={{ 
            margin: 0, 
            paddingLeft: '20px',
            fontSize: '14px'
          }}>
            <li style={{ marginBottom: '8px' }}>
              Pay <strong>${configOverrides.admission_deposit_amount || '100'}</strong> towards admission fee within <strong>{configOverrides.admission_deposit_deadline || '2 weeks'}</strong> to reserve your seat.
            </li>
            <li style={{ marginBottom: '8px' }}>
              Complete the <strong>${configOverrides.admission_balance_amount || '250'} balance</strong> by <strong>{configOverrides.admission_balance_deadline || '30 April'}</strong> and proceed to Visa application.
            </li>
          </ul>
        )}
      </div>

      {/* Refund Policy on Student Details page */}
      <div style={{ 
        marginTop: '25px',
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #1a237e' 
      }}>
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1a237e', 
          marginBottom: '15px'
        }}>
          REFUND POLICY
        </h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          fontSize: '14px'
        }}>
          <li style={{ marginBottom: '8px' }}>
            If by any chance, SKIES Uni-Connect fails to provide you with an admission letter from the university, admission fee will be refunded.
          </li>
          <li>
            If by any chance, the student fails to provide original and valid documents, forfeiture and/or failure to report, the enrolment fee will not be refunded.
          </li>
        </ul>
      </div>
    </div>

    {/* Signature Section - moved to new page */}
    <div className="force-page-break" style={{ 
      marginTop: '40px',
      marginBottom: '25px',
      pageBreakBefore: 'always',
      breakBefore: 'always'
    }}>
      <p style={{ marginBottom: '15px' }}>
        Best Wishes &amp; Regards,
      </p>
      {/* Signature area with stamp overlay */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* CEO Signature above the underline */}
        <div style={{ textAlign: 'left', marginBottom: '5px' }}>
          <img 
            src="/ceo_signature.png" 
            alt="CEO Signature" 
            style={{ maxWidth: '100px', width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
        {/* Director name block with underline */}
        <div style={{ 
          borderTop: '2px solid #1a237e',
          paddingTop: '15px',
          minWidth: '200px',
          textAlign: 'left'
        }}>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '16px',
            color: '#1a237e'
          }}>
            EVIDENCE ZOMBA
          </div>
          <div style={{ 
            fontSize: '14px',
            color: '#666',
            marginBottom: '10px'
          }}>
            Director, SKIES Uni-Connect
          </div>
        </div>
        {/* Absolute-positioned stamp so it doesn't shift layout */}
        <div style={{ position: 'absolute', right: -300, top: -30, zIndex: 10, pointerEvents: 'none' }}>
          <img src="/skies_stamp-no_bg.png" alt="Admissions Stamp" style={{ width: 220, display: 'block', transform: 'rotate(-10deg)' }} />
        </div>
      </div>
    </div>

    {/* Footer */}
    <div style={{ 
      fontSize: '12px', 
      color: '#666',
      marginTop: '30px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '5px',
      borderTop: '2px solid #1a237e',
      fontFamily: 'Arial, Helvetica, sans-serif' // Use professional sans-serif for numbers in footer
    }}>
      <p style={{ marginBottom: '15px' }}>
        <strong>Payment Instructions:</strong> Tuition Fee and Admission Fee payments can be made through our bank account. Please share proof of payment with your academic counselor. Alternatively, payments can be made at SKIES UniConnect offices.
      </p>
      <div style={{ 
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontFamily: 'Arial, Helvetica, sans-serif'
      }}>
        <h5 style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: '#1a237e', 
          marginBottom: '10px',
          textAlign: 'center',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          BANK DETAILS
        </h5>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          <div><strong>Bank Name:</strong> CBZ BANK</div>
          <div><strong>Branch:</strong> SELOUS AVENUE BRANCH</div>
          <div><strong>Account Name:</strong> SKIES UNNICONECT PVT LTD</div>
          <div><strong>Account Number:</strong> 274 0003 0015</div>
          <div><strong>Swift Code:</strong> COBZZHAXXX</div>
        </div>
      </div>
    </div>
  </div>
));

const ADMISSION_BALANCE = 250;
const BALANCE_DEADLINE = '30 April';

function AcceptanceLetterOverridesForm({ initial, onSave, onCancel }) {
  const [form, setForm] = React.useState(initial);
  const [extraCosts, setExtraCosts] = React.useState(initial.extra_costs || []);
  const [intakeError, setIntakeError] = React.useState(null);

  React.useEffect(() => {
    // ensure intake field exists in form state
    setForm(f => ({ intake: initial?.intake || '', ...f }));
  }, [initial]);

  // use shared extractYearFromIntake from utils

  // validate intake when it changes
  React.useEffect(() => {
    const val = form?.intake || '';
    const year = extractYearFromIntake(val);
    setIntakeError(val && !year ? 'Intake should include a year (e.g. Sep 2026).' : null);
  }, [form?.intake]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleExtraCostChange = (idx, field, value) => {
    setExtraCosts(costs => costs.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };
  const handleAddExtraCost = () => {
    setExtraCosts(costs => [...costs, { label: '', value: '' }]);
  };
  const handleRemoveExtraCost = (idx) => {
    setExtraCosts(costs => costs.filter((_, i) => i !== idx));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, extra_costs: extraCosts });
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Admission Deposit Amount ($)</label>
        <input type="text" className="form-control" name="admission_deposit_amount" value={form.admission_deposit_amount || ''} onChange={handleChange} placeholder="e.g. 100" />
      </div>
      <div className="mb-3">
        <label className="form-label">Default Intake (e.g. Sep 2025)</label>
        <input type="text" className="form-control" name="intake" value={form.intake || ''} onChange={handleChange} placeholder="e.g. Sep 2025" />
  {intakeError && <div className="form-text text-danger">{intakeError}</div>}
      </div>
      <div className="mb-3">
        <label className="form-label">Deposit Deadline</label>
        <input type="text" className="form-control" name="admission_deposit_deadline" value={form.admission_deposit_deadline || ''} onChange={handleChange} placeholder="e.g. 2 weeks" />
      </div>
      <div className="mb-3">
        <label className="form-label">Admission Balance Amount ($)</label>
        <input type="text" className="form-control" name="admission_balance_amount" value={form.admission_balance_amount || ''} onChange={handleChange} placeholder="e.g. 250" />
      </div>
      <div className="mb-3">
        <label className="form-label">Balance Deadline</label>
        <input type="text" className="form-control" name="admission_balance_deadline" value={form.admission_balance_deadline || ''} onChange={handleChange} placeholder="e.g. 30 April" />
      </div>
      <div className="mb-3">
        <label className="form-label">Payment Policy</label>
        <textarea className="form-control" name="payment_policy" value={form.payment_policy || ''} onChange={handleChange} rows={3} placeholder="e.g. Pay $100 within 2 weeks to reserve your seat. Complete $250 balance by 30 April and proceed to Visa application." />
      </div>
      <div className="mb-4">
        <label className="form-label">Extra Costs</label>
        {extraCosts.map((cost, idx) => (
          <div className="d-flex align-items-center mb-2" key={idx}>
            <input type="text" className="form-control me-2" placeholder="Label (e.g. Visa Fee)" value={cost.label} onChange={e => handleExtraCostChange(idx, 'label', e.target.value)} style={{ maxWidth: 180 }} />
            <input type="text" className="form-control me-2" placeholder="Value (e.g. USD83)" value={cost.value} onChange={e => handleExtraCostChange(idx, 'value', e.target.value)} style={{ maxWidth: 180 }} />
            <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveExtraCost(idx)}>&times;</button>
          </div>
        ))}
        <div>
          <button type="button" className="btn btn-outline-primary btn-sm mt-2" onClick={handleAddExtraCost}>Add Extra Cost</button>
        </div>
      </div>
      <div className="d-flex gap-2">
  <button type="submit" className="btn btn-primary" disabled={!!intakeError}>Apply</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

const ChatbotUserDetail = ({ userId }) => {
  const authUser = useSelector(state => state.auth.user);
  const isSuperuser = authUser?.is_superuser;
  if (!userId) return <div>User not found.</div>;
  const { data: user, isLoading: userLoading } = useGetUserQuery(userId);
  const { data: statusesData } = useGetRegistrationStatusesQuery();
  const statuses = statusesData?.results || [];
  const { data: idDocs = [], isLoading: idDocsLoading } = useGetIdDocumentsQuery(userId, { skip: !userId });
  const { data: resultDocs = [], isLoading: resultDocsLoading } = useGetResultDocumentsQuery(userId, { skip: !userId });
  // backend already filters by user
  const userIdDocs = idDocs;
  const userResultDocs = resultDocs;
  const [editRegistrationStatus, { isLoading: isSaving }] = useEditRegistrationStatusMutation();
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [programScholarshipSuccess, setProgramScholarshipSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const navigate = useNavigate();
  const [editUser, { isLoading: isSavingUser }] = useEditUserMutation();
  const { data: programsData = [] } = useGetProgramsQuery();
  const { data: scholarshipsData = [] } = useGetScholarshipsQuery();
  const programs = programsData.results || programsData || [];
  const scholarships = scholarshipsData.results || scholarshipsData || [];
  const [editProgram, setEditProgram] = useState('');
  const [editScholarship, setEditScholarship] = useState('');
  React.useEffect(() => {
    if (user) {
      setEditProgram(user.program || '');
      setEditScholarship(user.scholarship || '');
    }
  }, [user]);

  // Find this user's registration status (support multiple API shapes and fallback to nested user.registration_status)
  const regStatusFromList = statuses.find(s =>
    s?.user === user?.id ||
    s?.user_id === user?.id ||
    (s?.user && typeof s.user === 'object' && s.user.id === user?.id)
  );
  // prefer the list entry if present, otherwise use the nested registration_status on the user
  const regStatus = regStatusFromList || user?.registration_status || null;
  const [editStatus, setEditStatus] = useState(regStatus?.status || '');
  React.useEffect(() => {
    setEditStatus(regStatus?.status || '');
  }, [regStatus?.status]);

  // State for preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrides, setOverrides] = useState(null);

  const { data: acceptanceConfig } = useGetAcceptanceLetterConfigQuery();

  const letterData = {
    full_name: user?.name || '',
    date: regStatus?.updated_at ? new Date(regStatus.updated_at).toLocaleDateString() : '',
    app_id: `SK${user?.id?.toString().padStart(5, '0') || '00000'}`,
  // year and class_year should match the intake year when available
  // compute intake string first
  // (overrides already contains intake field when editing preview)
  // intake precedence: overrides -> acceptanceConfig -> regStatus.created_at
  // we'll compute the intakeStr and derive a 4-digit year from it if present
    
  // placeholder values; we'll set these below after computing intakeStr
  year: undefined,
  class_year: undefined,
    program: programs.find(p => p.id === user?.program)?.name || '',
    duration: programs.find(p => p.id === user?.program)?.duration || '',
    tuition: programs.find(p => p.id === user?.program)?.tuition || '',
    admission_fee: programs.find(p => p.id === user?.program)?.admission_fee || '',
    scholarship: scholarships.find(s => s.id === user?.scholarship)?.percentage || '',
  intake: (overrides?.intake) || (acceptanceConfig?.intake) || formatIntakeFromDate(regStatus?.created_at),
    // logo_url: '/media/skies_logo.jpg', // Uncomment and adjust if you want to use a logo
  };

  // Derive year/class_year from the intake string if possible, else fallback to current year
  const intakeStr = letterData.intake || '';
  const derivedYear = extractYearFromIntake(intakeStr) || new Date().getFullYear().toString();
  letterData.year = derivedYear;
  letterData.class_year = derivedYear;
  const pdfRef = React.useRef();
  const handleShowPreview = () => setShowPreview(true);
  const handleClosePreview = () => setShowPreview(false);
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);
    try {
      // html2pdf returns a promise from save(), await it so we can show loading state
      await html2pdf().set({
        margin: 12, // mm
        filename: `${letterData.full_name.replace(/[^a-zA-Z0-9]/g, '_')}_acceptance_letter.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      }).from(pdfRef.current).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (userLoading || idDocsLoading || resultDocsLoading) return <div>Loading user...</div>;
  if (!user) return <div>User not found.</div>;

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setStatusSuccess(false);
    if (!regStatus) return;
    try {
      await editRegistrationStatus({ ...regStatus, status: editStatus }).unwrap();
      setStatusSuccess(true);
    } catch {
      setStatusSuccess(false);
    }
  };

  const handleDownloadAcceptanceLetter = async () => {
    setDownloading(true);
    setDownloadError(null);
    console.log('Download Acceptance Letter button clicked for user:', user.id);
    try {
      let response;
      try {
        response = await fetch(`/chatbot/acceptance-letter/${user.id}/?t=${Date.now()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } catch (networkErr) {
        setDownloadError('Network error: could not download acceptance letter. Check your connection and try again.');
        console.error('Network error downloading acceptance letter:', networkErr);
        setDownloading(false);
        return;
      }
      console.log('Download response status:', response.status);
      if (!response.ok) {
        throw new Error('Failed to download');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `acceptance_letter_${user.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError('Could not download acceptance letter.');
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleSaveProgramScholarship = async (e) => {
    e.preventDefault();
    setProgramScholarshipSuccess(false);
    try {
      await editUser({ ...user, program: editProgram, scholarship: editScholarship }).unwrap();
      setProgramScholarshipSuccess(true);
    } catch {
      setProgramScholarshipSuccess(false);
    }
  };

  return (
    <div className="container py-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>&larr; Back</button>
      <h2 className="mb-4">User Details</h2>
      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Profile</h5>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone_number}</p>
              <p className="text-muted"><strong>Applied:</strong> {user.application_date ? new Date(user.application_date).toLocaleString() : 'N/A'}
              {user.registration_date && (
                <><br/><strong>Registered:</strong> {new Date(user.registration_date).toLocaleString()}</>
              )}
              </p>
              <p><strong>Preferred Contact Time:</strong> {user.preferred_contact_times ? (
                user.preferred_contact_times === 'morning' ? 'Morning (9am-12pm)' :
                user.preferred_contact_times === 'afternoon' ? 'Afternoon (12pm-5pm)' :
                user.preferred_contact_times === 'evening' ? 'Evening (5pm-9pm)' : user.preferred_contact_times
              ) : 'N/A'}</p>
              <p><strong>Preferred Contact Days:</strong> {user.preferred_contact_days || 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Registration Status</h5>
              {regStatus ? (
                <>
                  <p><strong>Status:</strong> <StatusBadge status={regStatus.status} /></p>
                  <form onSubmit={handleStatusSubmit} className="mt-2">
                    <div className="mb-2">
                      <select
                        className="form-select"
                        value={editStatus}
                        onChange={e => setEditStatus(e.target.value)}
                        disabled={isSaving || (!isSuperuser && regStatus.status !== 'pending')}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isSaving || editStatus === regStatus.status || (!isSuperuser && regStatus.status !== 'pending')}>
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    {statusSuccess && <span className="text-success ms-2">Status updated!</span>}
                  </form>
                  {/* Download Acceptance Letter Button */}
                  {regStatus.status === 'accepted' && (
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-info btn-sm me-2"
                        onClick={handleShowPreview}
                      >
                        Preview Acceptance Letter
                      </button>
                      <Modal show={showPreview} onHide={handleClosePreview} size="lg" centered>
                        <Modal.Header closeButton>
                          <Modal.Title>Acceptance Letter Preview</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                          <AcceptanceLetterPDF
                            ref={pdfRef}
                            letterData={letterData}
                            extraCosts={(overrides?.extra_costs || acceptanceConfig?.extra_costs || [])}
                            configOverrides={overrides || acceptanceConfig}
                          />
                          <button className="btn btn-outline-secondary mt-3" onClick={() => setShowOverrides(true)}>
                            Edit Acceptance Letter Settings
                          </button>
                          <Modal show={showOverrides} onHide={() => setShowOverrides(false)} centered>
                            <Modal.Header closeButton>
                              <Modal.Title>Edit Acceptance Letter Settings</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <AcceptanceLetterOverridesForm
                                initial={overrides || acceptanceConfig || {}}
                                onSave={vals => { setOverrides(vals); setShowOverrides(false); }}
                                onCancel={() => setShowOverrides(false)}
                              />
                            </Modal.Body>
                          </Modal>
                        </Modal.Body>
                        <Modal.Footer>
                          <button className="btn btn-success" onClick={handleDownloadPDF} disabled={pdfGenerating}>
                            {pdfGenerating ? (
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : null}
                            {pdfGenerating ? 'Generating...' : 'Download PDF'}
                          </button>
                          <button className="btn btn-secondary" onClick={handleClosePreview} disabled={pdfGenerating}>
                            Close
                          </button>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  )}
                </>
              ) : <p>No registration status found.</p>}
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Program & Scholarship</h5>
              <form onSubmit={handleSaveProgramScholarship} className="mb-2">
                <div className="mb-2">
                  <label className="form-label">Program</label>
                  <select className="form-select" value={editProgram || ''} onChange={e => setEditProgram(e.target.value)}>
                    <option value="">Select program</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label">Scholarship</label>
                  <select className="form-select" value={editScholarship || ''} onChange={e => setEditScholarship(e.target.value)}>
                    <option value="">Select scholarship</option>
                    {scholarships.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.percentage})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSavingUser}>Save</button>
                {programScholarshipSuccess && <span className="text-success ms-2">Saved!</span>}
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">ID Documents</h5>
              {userIdDocs.length === 0 ? <p>No ID documents.</p> : (
                <ul className="list-unstyled mb-0">
                  {userIdDocs.map(doc => (
                    <li key={doc.id}>
                      <a href={doc.document} target="_blank" rel="noopener noreferrer">{doc.document.split('/').pop()}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Result Documents</h5>
              {userResultDocs.length === 0 ? <p>No result documents.</p> : (
                <ul className="list-unstyled mb-0">
                  {userResultDocs.map(doc => (
                    <li key={doc.id}>
                      <a href={doc.document} target="_blank" rel="noopener noreferrer">{doc.document.split('/').pop()}</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Preferred courses</h5>
              {user.note_to_admin ? (
                <p>{user.note_to_admin}</p>
              ) : (
                <p className="text-muted">No courses provided.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Preferred Countries</h5>
              {Array.isArray(user.preferred_countries) && user.preferred_countries.length > 0 ? (
                <ul className="list-unstyled mb-0">
                  {user.preferred_countries.map((country, idx) => (
                    <li key={idx}>{country}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No preferred countries provided.</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-2">Sponsor Details</h5>
              {user.sponsors && user.sponsors.length > 0 ? (
                <ul className="list-unstyled mb-0">
                  {user.sponsors.map((sponsor, idx) => (
                    <li key={idx} className="mb-3">
                      <div><strong>Name:</strong> {sponsor.name}</div>
                      <div><strong>Relationship:</strong> {sponsor.relationship}</div>
                      <div><strong>Phone:</strong> {sponsor.phone}</div>
                      {sponsor.email && <div><strong>Email:</strong> {sponsor.email}</div>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No sponsor details provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatusBadge({ status }) {
  let color = 'secondary';
  if (status === 'pending') color = 'warning';
  else if (status === 'accepted') color = 'success';
  else if (status === 'rejected') color = 'danger';
  return <span className={`badge bg-${color} text-capitalize`}>{status}</span>;
}

// Utility to capitalize each word
function capitalizeWords(str) {
  return str.replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export default ChatbotUserDetail;
