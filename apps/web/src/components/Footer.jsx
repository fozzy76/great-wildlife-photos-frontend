import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup.jsx';

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a]" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12">

          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-block', marginBottom: '12px' }}>
              <img src="https://horizons-cdn.hostinger.com/63a3c31a-cdf5-47c2-8678-f4b23ba82f8e/176a168fe010d7d3fc2d13e9bf054d5e.png" alt="Great Wildlife Photos" style={{ height: '90px', width: 'auto' }} />
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.7' }}>
              Award-winning North American wildlife photography by Lynn Starnes. All photographs are © Lynn Starnes, all rights reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '10px', fontStyle: 'italic', lineHeight: '1.6' }}>
              Every photograph captured in the wild.<br />Never staged. Never AI-generated.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Quick links</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['/', 'Home'], ['/gallery', 'Gallery'], ['/blog', 'Blog'], ['/about', 'About'], ['/faq', 'FAQ'], ['/contact', 'Contact']].map(([path, label]) => (
                <li key={path}>
                  <Link to={path} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Contact</h3>
            <a href="mailto:lynn@greatwildlifephotos.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', textDecoration: 'none' }}>
              <Mail className="w-4 h-4" style={{ flexShrink: 0 }} />
              lynn@greatwildlifephotos.com
            </a>
          </div>

          {/* Newsletter */}
          <div>
            <h3 style={{ color: 'white', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Newsletter</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
              Subscribe for new photo releases and exclusive offers.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 0' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
              © 2026 Lynn Starnes / Great Wildlife Photos. All photographs are trademarked and may not be reproduced without written permission.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <Link to="/privacy" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/terms" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textDecoration: 'none' }}>Terms of Service</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
                {[['#', Facebook], ['#', Instagram], ['#', Twitter]].map(([href, Icon], i) => (
                  <a key={i} href={href} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxHeight: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'rgba(255,255,255,0.7)', padding: '0 8px', whiteSpace: 'nowrap', backgroundColor: 'transparent', fontWeight: '300', fontSize: '.8em' }}>
        <small> 
          <a style = {{ color: 'rgba(255, 255, 255, 0.18)', textDecoration: 'none',}} href="https://76designsolutions.com/steady-climb-seo-service/" target="_blank" rel="noopener noreferrer">Brand managed by 76 Design Solutions</a>
        </small>
      </div>
    </footer>
  );
};

export default Footer;