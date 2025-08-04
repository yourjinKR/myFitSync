import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaHome, FaDumbbell, FaUserTie, FaComments, FaUserCircle, FaCrown, FaMoneyBillAlt, FaRegMoneyBillAlt, FaMoneyBillWave, FaRobot } from 'react-icons/fa';

const slideIn = keyframes`
    from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
`;

const slideOut = keyframes`
    from {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    to {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
    }
`;

const fadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const fadeOut = keyframes`
    from {
        opacity: 1;
        transform: translateY(0);
    }
    to {
        opacity: 0;
        transform: translateY(-20px);
    }
`;

const SideNavWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    background: rgba(26, 26, 26, 0.95);
    backdrop-filter: blur(10px);
    border-left: 1px solid var(--border-light);
    border-right: 1px solid var(--border-light);
    box-shadow: 
        0 0 40px rgba(0,0,0,0.3),
        inset 0 1px 0 var(--border-light);
    padding: 20px;
    animation: ${({ $isClosing }) => $isClosing ? slideOut : slideIn} 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;
const SideNavLinks = styled.div`
    display: flex;
    width: 80%;
    max-width: 600px;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 35px;
    gap: 8px;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--border-light);
    box-shadow: 
        0 8px 32px rgba(0,0,0,0.4),
        inset 0 1px 0 var(--border-medium);
    animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both;

    h2 {
        font-size: 3rem;
        font-weight: 700;
        color: var(--text-primary);
        text-align: center;
        letter-spacing: 1px;
        animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
    }
`;
const StyledLink = styled(Link)`
    display: flex;
    align-items: center;
    width: 80%;
    gap: 16px;
    font-size: 3rem;
    font-weight: 500;
    color: ${({ $active }) => ($active ? 'var(--primary-blue)' : 'var(--text-secondary)')};
    background: transparent;
    border: none;
    padding: 16px 20px;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    animation: ${({ $isClosing }) => $isClosing ? fadeOut : fadeIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${({ $index, $isClosing }) => $isClosing ? 0 : 0.3 + ($index * 0.05)}s both;

    &::after {
        content: '';
        position: absolute;
        bottom: 8px;
        left: 20px;
        right: 20px;
        height: 2px;
        background: var(--primary-blue);
        transform: scaleX(${({ $active }) => $active ? 1 : 0});
        transform-origin: left;
        transition: transform 0.3s ease;
    }

    &:hover {
        color: var(--primary-blue);
        background: rgba(74, 144, 226, 0.1);
        
        &::after {
            transform: scaleX(1);
        }
    }

    svg {
        font-size: 1.3em;
        transition: all 0.3s ease;
    }

    &:hover svg {
        transform: translateX(4px) scale(1.1);
    }
`;
    const memberType = sessionStorage.getItem("member_type");
    const memberIdx = sessionStorage.getItem("member_idx");

    const navItems = [
    { to: "/", label: "홈", icon: <FaHome /> },
    { to: "/routine/view", label: "루틴", icon: <FaDumbbell /> },
    { to: "/trainer/search", label: "트레이너", icon: <FaUserTie /> },
    { to: "/chat", label: "채팅", icon: <FaComments /> },
        memberType === "trainer"
            ? { to: `/trainer/view/${memberIdx}`, label: "마이페이지", icon: <FaUserCircle /> }
            : { to: "/mypage", label: "마이페이지", icon: <FaUserCircle /> },
    { to: "/subscription", label: "구독/결제", icon: <FaMoneyBillWave /> },
    { to: "/ai", label: "AI 서비스", icon: <FaRobot /> },
    ...(memberType === "admin" ? [{ to: "/admin", label: "관리자", icon: <FaCrown /> }] : []),
];

const SideNav = ({ setIsOpen }) => {
    const location = useLocation();
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
        }, 300); // 애니메이션 시간과 맞춤
    };

    return (
        <SideNavWrapper $isClosing={isClosing} onClick={handleClose}>
            <SideNavLinks $isClosing={isClosing} onClick={(e) => e.stopPropagation()}>
                <h2>FitSync</h2>
                {navItems.map((item, index) => (
                    <StyledLink
                        key={item.to}
                        to={item.to}
                        $active={location.pathname === item.to}
                        $index={index}
                        $isClosing={isClosing}
                        onClick={handleClose}
                    >
                        {item.icon}
                        {item.label}
                    </StyledLink>
                ))}
            </SideNavLinks>
        </SideNavWrapper>
    );
};

export default SideNav;