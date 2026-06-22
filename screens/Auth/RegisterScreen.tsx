import React, { useContext, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Svg, { G, Polygon } from 'react-native-svg';

import colors from '../../constants/colors';
import AuthContext from '../../modules/API/AuthContext';
import { getApiErrorMessage } from '../../helpers/apiErrors';
import { isValidEmail, isValidLength } from '../../helpers/validation';
import logger from '../../helpers/logger';
import { RegisterScreenProps } from '../../types/navigation';
import { palette } from '../../constants/theme';

type RegisterStep = 'name' | 'access' | 'plan';
type PlanKey = 'free' | 'semi' | 'pro';
type BillingCycle = 'monthly' | 'yearly';

const STEPS: RegisterStep[] = ['name', 'access', 'plan'];

const PLANS: Array<{
    key: PlanKey;
    name: string;
    subtitle: string;
    price: string;
    caption: string;
    popular?: boolean;
    features: string[];
}> = [
    {
        key: 'free',
        name: 'Gratuito',
        subtitle: 'Hobby · 1-5 apiarios',
        price: '0',
        caption: '/ mes para siempre',
        features: ['1 apiario', 'Tareas y visitas', 'Hasta 10 colmenas', 'Soporte por email'],
    },
    {
        key: 'semi',
        name: 'Semi-pro',
        subtitle: 'Crecimiento · 6-50 apiarios',
        price: '4,99',
        caption: '/ mes · facturado anual',
        popular: true,
        features: ['Apiarios ilimitados', 'Reportes y graficos', 'Asistente IA · 50 consultas', 'Exportar PDF + Excel'],
    },
    {
        key: 'pro',
        name: 'Pro',
        subtitle: 'Empresa · alto volumen',
        price: '14,99',
        caption: '/ mes · facturado anual',
        features: ['IA sin limite', 'Usuarios del equipo', 'Estadisticas avanzadas', 'Soporte prioritario'],
    },
];

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const insets = useSafeAreaInsets();
    const { Register, isLoading } = useContext(AuthContext);

    const [step, setStep] = useState<RegisterStep>('name');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>('semi');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loading = isLoading || isSubmitting;
    const stepIndex = STEPS.indexOf(step);
    const selectedPlanData = PLANS.find((plan) => plan.key === selectedPlan) ?? PLANS[1];
    const firstName = useMemo(() => fullName.trim().split(/\s+/)[0] ?? '', [fullName]);

    const namePayload = useMemo(() => {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        return {
            name: parts[0] ?? '',
            surname: parts.slice(1).join(' '),
        };
    }, [fullName]);

    const passwordChecks = useMemo(() => ({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
    }), [password]);

    const passwordScore = Object.values(passwordChecks).filter(Boolean).length;
    const strengthLabel = passwordScore >= 4 ? 'MUY FUERTE' : passwordScore >= 3 ? 'FUERTE' : passwordScore >= 2 ? 'MEDIA' : 'DEBIL';
    const strengthColor = passwordScore >= 3 ? colors.SUCCESS_TEXT : passwordScore >= 2 ? palette.honey : colors.DANGER;

    const validateName = () => {
        if (!isValidLength(namePayload.name, 3, 50) || !isValidLength(namePayload.surname, 3, 50)) {
            ToastAndroid.show('Ingresa nombre y apellido para crear tu cuenta', ToastAndroid.SHORT);
            return false;
        }

        return true;
    };

    const validateAccess = () => {
        if (!email || !isValidEmail(email)) {
            ToastAndroid.show('Por favor ingresa un email valido', ToastAndroid.SHORT);
            return false;
        }

        if (!password || !isValidLength(password, 8, 50)) {
            ToastAndroid.show('La contrasena debe tener entre 8 y 50 caracteres', ToastAndroid.SHORT);
            return false;
        }

        if (passwordScore < 3) {
            ToastAndroid.show('Usa una contrasena mas segura', ToastAndroid.SHORT);
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateName() || !validateAccess()) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (!Register) {
                ToastAndroid.show('Error interno del sistema de autenticacion.', ToastAndroid.SHORT);
                return;
            }

            const success = await Register({
                name: namePayload.name,
                surname: namePayload.surname,
                email,
                password,
            });

            if (success) {
                ToastAndroid.show(`Cuenta creada. Plan inicial: ${selectedPlanData.name}`, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show('No se pudo completar el registro. Intenta nuevamente.', ToastAndroid.SHORT);
            }
        } catch (error: any) {
            const errorMessage = getApiErrorMessage(error, 'Error al registrar');
            ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
            logger.error('[RegisterScreen] Error al registrar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 'name') {
            if (validateName()) setStep('access');
            return;
        }

        if (step === 'access') {
            if (validateAccess()) setStep('plan');
            return;
        }

        void handleRegister();
    };

    const handleBack = () => {
        if (step === 'name') {
            navigation.goBack();
            return;
        }

        setStep(STEPS[stepIndex - 1]);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.topbar, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.75}>
                    <Icon name="chevron-back" size={18} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>
                <Text style={styles.stepText}>{stepIndex + 1} · {STEPS.length}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} activeOpacity={0.75}>
                    <Text style={styles.skipText}>Iniciar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: step === 'plan' ? Math.max(insets.bottom, 18) + 18 : Math.max(insets.bottom, 18) + 110 },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {step === 'name' ? (
                    <NameStep fullName={fullName} setFullName={setFullName} />
                ) : null}

                {step === 'access' ? (
                    <AccessStep
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        firstName={firstName}
                        passwordChecks={passwordChecks}
                        passwordScore={passwordScore}
                        strengthLabel={strengthLabel}
                        strengthColor={strengthColor}
                    />
                ) : null}

                {step === 'plan' ? (
                    <PlanStep
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        billingCycle={billingCycle}
                        setBillingCycle={setBillingCycle}
                        selectedPlanData={selectedPlanData}
                        loading={loading}
                        onSubmit={handleRegister}
                    />
                ) : null}
            </ScrollView>

            {step !== 'plan' ? (
                <TouchableOpacity
                    style={[styles.nextButton, { bottom: Math.max(insets.bottom, 18) + 18 }]}
                    onPress={handleNext}
                    activeOpacity={0.86}
                >
                    <Icon name="arrow-forward" size={25} color={colors.WHITE} />
                </TouchableOpacity>
            ) : null}
        </KeyboardAvoidingView>
    );
};

function NameStep({
    fullName,
    setFullName,
}: {
    fullName: string;
    setFullName: (value: string) => void;
}) {
    return (
        <View style={styles.stepContainer}>
            <Text style={styles.eyebrow}>Hola.</Text>
            <Text style={styles.heroTitle}>Cual es tu nombre?</Text>

            <View style={styles.underlineField}>
                <TextInput
                    style={styles.largeInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Roman Hoffer"
                    placeholderTextColor={colors.SLATE[300]}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                />
            </View>
            <Text style={styles.hint}>Usaremos tu nombre y apellido para personalizar tu experiencia.</Text>

            <View style={styles.illustrationWrap}>
                <HoneycombBackground />
                <View style={styles.beeBody}>
                    <View style={styles.beeWingLeft} />
                    <View style={styles.beeWingRight} />
                    <View style={styles.beeStripe} />
                    <View style={styles.beeStripe} />
                    <View style={styles.beeStripe} />
                </View>
            </View>
        </View>
    );
}

function AccessStep({
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    firstName,
    passwordChecks,
    passwordScore,
    strengthLabel,
    strengthColor,
}: {
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    showPassword: boolean;
    setShowPassword: (value: boolean) => void;
    firstName: string;
    passwordChecks: { length: boolean; uppercase: boolean; number: boolean; symbol: boolean };
    passwordScore: number;
    strengthLabel: string;
    strengthColor: string;
}) {
    const emailValid = isValidEmail(email);

    return (
        <View style={styles.stepContainer}>
            <Text style={styles.eyebrow}>{firstName ? `Hola, ${firstName}.` : 'Casi listo.'}</Text>
            <Text style={styles.heroTitle}>Crea tu acceso.</Text>

            <View style={styles.accessField}>
                <Text style={styles.fieldLabel}>Correo</Text>
                <View style={styles.underlineRow}>
                    <TextInput
                        style={styles.accessInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="tu@email.com"
                        placeholderTextColor={colors.SLATE[300]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                        returnKeyType="next"
                    />
                    {emailValid ? (
                        <View style={styles.validBadge}>
                            <Icon name="checkmark" size={18} color={colors.WHITE} />
                        </View>
                    ) : null}
                </View>
                <Text style={styles.hint}>Te enviaremos un enlace para confirmar tu cuenta.</Text>
            </View>

            <View style={styles.accessField}>
                <Text style={styles.fieldLabel}>Contrasena</Text>
                <View style={styles.underlineRow}>
                    <TextInput
                        style={styles.accessInput}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Minimo 8 caracteres"
                        placeholderTextColor={colors.SLATE[300]}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                    />
                    <TouchableOpacity
                        style={styles.eyeBadge}
                        onPress={() => setShowPassword(!showPassword)}
                        activeOpacity={0.75}
                    >
                        <Icon name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={16} color={colors.SLATE[600]} />
                    </TouchableOpacity>
                </View>

                <View style={styles.strengthRow}>
                    {[0, 1, 2, 3].map((item) => (
                        <View
                            key={item}
                            style={[
                                styles.strengthBar,
                                {
                                    backgroundColor: item < passwordScore ? strengthColor : colors.SLATE[200],
                                },
                            ]}
                        />
                    ))}
                    <Text style={[styles.strengthText, { color: strengthColor }]}>{strengthLabel}</Text>
                </View>

                <View style={styles.requirementsGrid}>
                    <Requirement checked={passwordChecks.length} text="8 caracteres" />
                    <Requirement checked={passwordChecks.uppercase} text="Una mayuscula" />
                    <Requirement checked={passwordChecks.number} text="Un numero" />
                    <Requirement checked={passwordChecks.symbol} text="Un simbolo" />
                </View>
            </View>

            <View style={styles.illustrationWrapCompact}>
                <HoneycombBackground />
                <View style={styles.lockIllustration}>
                    <View style={styles.lockShackle} />
                    <View style={styles.lockBody}>
                        <View style={styles.lockKeyhole} />
                    </View>
                </View>
            </View>
        </View>
    );
}

function Requirement({ checked, text }: { checked: boolean; text: string }) {
    return (
        <View style={styles.requirement}>
            <View style={[styles.requirementIcon, checked && styles.requirementIconActive]}>
                <Icon name="checkmark" size={11} color={checked ? colors.WHITE : colors.SLATE[400]} />
            </View>
            <Text style={[styles.requirementText, !checked && styles.requirementTextMuted]}>{text}</Text>
        </View>
    );
}

function PlanStep({
    selectedPlan,
    setSelectedPlan,
    billingCycle,
    setBillingCycle,
    selectedPlanData,
    loading,
    onSubmit,
}: {
    selectedPlan: PlanKey;
    setSelectedPlan: (value: PlanKey) => void;
    billingCycle: BillingCycle;
    setBillingCycle: (value: BillingCycle) => void;
    selectedPlanData: typeof PLANS[number];
    loading: boolean;
    onSubmit: () => void;
}) {
    return (
        <View style={styles.planContainer}>
            <Text style={styles.eyebrow}>Ultimo paso.</Text>
            <Text style={styles.planTitle}>Elige tu plan.</Text>
            <Text style={styles.planSubtitle}>Empieza gratis, cambia cuando quieras.</Text>

            <View style={styles.billingSwitch}>
                <TouchableOpacity
                    style={[styles.billingOption, billingCycle === 'monthly' && styles.billingOptionActive]}
                    onPress={() => setBillingCycle('monthly')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.billingText, billingCycle === 'monthly' && styles.billingTextActive]}>Mensual</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.billingOption, billingCycle === 'yearly' && styles.billingOptionActive]}
                    onPress={() => setBillingCycle('yearly')}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.billingText, billingCycle === 'yearly' && styles.billingTextActive]}>Anual</Text>
                    <View style={styles.discountPill}>
                        <Text style={styles.discountText}>-20%</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.planCards}>
                {PLANS.map((plan) => {
                    const selected = selectedPlan === plan.key;

                    return (
                        <TouchableOpacity
                            key={plan.key}
                            style={[styles.planCard, selected && styles.planCardSelected]}
                            onPress={() => setSelectedPlan(plan.key)}
                            activeOpacity={0.84}
                        >
                            {plan.popular ? (
                                <View style={styles.popularPill}>
                                    <Text style={styles.popularText}>POPULAR</Text>
                                </View>
                            ) : null}
                            <View style={styles.planHeaderRow}>
                                <View style={styles.planNameBlock}>
                                    <Text style={styles.planName}>{plan.name}</Text>
                                    <Text style={styles.planCardSubtitle}>{plan.subtitle}</Text>
                                </View>
                                <View style={styles.priceBlock}>
                                    <Text style={styles.priceText}>€{plan.price}</Text>
                                    <Text style={styles.priceCaption}>{plan.caption}</Text>
                                </View>
                            </View>

                            <View style={styles.planFeatures}>
                                {plan.features.map((feature) => (
                                    <View key={feature} style={styles.featureItem}>
                                        <Icon name="checkmark" size={12} color={colors.SUCCESS_TEXT} />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.planFooter}>
                <View>
                    <Text style={styles.chosenLabel}>HAS ELEGIDO</Text>
                    <Text style={styles.chosenPlan}>{selectedPlanData.name}</Text>
                    <Text style={styles.chosenPrice}>€{selectedPlanData.price}/mes</Text>
                </View>
                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={onSubmit}
                    disabled={loading}
                    activeOpacity={0.86}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.WHITE} size="small" />
                    ) : (
                        <>
                            <Text style={styles.submitButtonText}>
                                {selectedPlan === 'free' ? 'Crear cuenta' : 'Probar 30 dias'}
                            </Text>
                            <View style={styles.submitIcon}>
                                <Icon name="arrow-forward" size={18} color={colors.TEXT_PRIMARY} />
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

function HoneycombBackground() {
    const cells = [];
    for (let row = 0; row < 5; row += 1) {
        for (let col = 0; col < 8; col += 1) {
            const x = col * 52 + (row % 2 ? 26 : 0) - 34;
            const y = row * 45 + 10;
            const highlighted = (row === 2 && (col === 1 || col === 2)) || (row === 3 && col === 3);
            cells.push(
                <G key={`${row}-${col}`} transform={`translate(${x} ${y})`}>
                    <Polygon
                        points="26,0 52,15 52,45 26,60 0,45 0,15"
                        fill={highlighted ? palette.honey : colors.HONEY[50]}
                        stroke={highlighted ? palette.honey : colors.HONEY[100]}
                        strokeWidth="1.5"
                        opacity={highlighted ? 0.92 : 0.95}
                    />
                </G>
            );
        }
    }

    return (
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 390 250" preserveAspectRatio="xMidYMid slice">
            {cells}
        </Svg>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: palette.cream,
    },
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingBottom: 16,
        backgroundColor: palette.cream,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2ebdc',
    },
    stepText: {
        color: colors.SLATE[400],
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.4,
    },
    skipText: {
        color: colors.SLATE[700],
        fontSize: 13,
        fontWeight: '800',
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    stepContainer: {
        flex: 1,
        minHeight: 610,
        paddingHorizontal: 34,
    },
    eyebrow: {
        color: palette.honeyDark,
        fontSize: 15,
        fontWeight: '800',
        marginTop: 14,
        marginBottom: 8,
    },
    heroTitle: {
        color: colors.TEXT_PRIMARY,
        fontSize: 45,
        lineHeight: 46,
        fontWeight: '900',
        letterSpacing: -2.2,
        marginBottom: 30,
    },
    underlineField: {
        minHeight: 50,
        borderBottomWidth: 2,
        borderBottomColor: colors.TEXT_PRIMARY,
        justifyContent: 'center',
    },
    largeInput: {
        color: colors.TEXT_PRIMARY,
        fontSize: 27,
        fontWeight: '800',
        paddingVertical: 4,
    },
    hint: {
        color: colors.SLATE[600],
        fontSize: 13,
        lineHeight: 19,
        marginTop: 8,
    },
    illustrationWrap: {
        position: 'relative',
        minHeight: 260,
        marginHorizontal: -34,
        marginTop: 85,
        overflow: 'hidden',
    },
    illustrationWrapCompact: {
        position: 'relative',
        minHeight: 225,
        marginHorizontal: -34,
        marginTop: 48,
        overflow: 'hidden',
    },
    beeBody: {
        position: 'absolute',
        left: '50%',
        bottom: 32,
        width: 86,
        height: 116,
        marginLeft: -43,
        borderRadius: 44,
        backgroundColor: colors.TEXT_PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },
    beeWingLeft: {
        position: 'absolute',
        top: -10,
        left: -24,
        width: 58,
        height: 70,
        borderRadius: 34,
        backgroundColor: 'rgba(255, 249, 226, 0.82)',
    },
    beeWingRight: {
        position: 'absolute',
        top: -10,
        right: -24,
        width: 58,
        height: 70,
        borderRadius: 34,
        backgroundColor: 'rgba(255, 249, 226, 0.82)',
    },
    beeStripe: {
        width: 52,
        height: 6,
        borderRadius: 4,
        backgroundColor: colors.HONEY[300],
    },
    accessField: {
        marginBottom: 24,
    },
    fieldLabel: {
        color: colors.TEXT_PRIMARY,
        fontSize: 13,
        fontWeight: '800',
        marginBottom: 8,
    },
    underlineRow: {
        minHeight: 47,
        borderBottomWidth: 2,
        borderBottomColor: colors.TEXT_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    accessInput: {
        flex: 1,
        color: colors.TEXT_PRIMARY,
        fontSize: 24,
        fontWeight: '800',
        paddingVertical: 3,
        letterSpacing: -0.7,
    },
    validBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.SUCCESS_TEXT,
    },
    eyeBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee5d3',
    },
    strengthRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 13,
        marginBottom: 13,
    },
    strengthBar: {
        flex: 1,
        height: 5,
        borderRadius: 5,
    },
    strengthText: {
        fontSize: 11,
        fontWeight: '900',
        marginLeft: 3,
    },
    requirementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: 9,
    },
    requirement: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    requirementIcon: {
        width: 17,
        height: 17,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.SLATE[100],
    },
    requirementIconActive: {
        backgroundColor: colors.SUCCESS_TEXT,
    },
    requirementText: {
        color: colors.TEXT_PRIMARY,
        fontSize: 12,
        fontWeight: '800',
    },
    requirementTextMuted: {
        color: colors.SLATE[400],
    },
    lockIllustration: {
        position: 'absolute',
        left: '50%',
        bottom: 38,
        width: 92,
        height: 112,
        marginLeft: -46,
        alignItems: 'center',
    },
    lockShackle: {
        width: 52,
        height: 58,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 7,
        borderBottomWidth: 0,
        borderColor: colors.TEXT_PRIMARY,
        marginBottom: -10,
    },
    lockBody: {
        width: 78,
        height: 61,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.TEXT_PRIMARY,
        shadowColor: colors.TEXT_PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 5,
    },
    lockKeyhole: {
        width: 8,
        height: 23,
        borderRadius: 5,
        backgroundColor: palette.honey,
    },
    nextButton: {
        position: 'absolute',
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.TEXT_PRIMARY,
        shadowColor: colors.TEXT_PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.26,
        shadowRadius: 14,
        elevation: 7,
    },
    planContainer: {
        paddingHorizontal: 30,
        paddingBottom: 10,
    },
    planTitle: {
        color: colors.TEXT_PRIMARY,
        fontSize: 42,
        lineHeight: 43,
        fontWeight: '900',
        letterSpacing: -2,
    },
    planSubtitle: {
        color: colors.SLATE[600],
        fontSize: 14,
        marginTop: 6,
        marginBottom: 20,
    },
    billingSwitch: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 22,
        backgroundColor: '#eee6d7',
        marginBottom: 18,
    },
    billingOption: {
        flex: 1,
        minHeight: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 7,
    },
    billingOptionActive: {
        backgroundColor: colors.WHITE,
    },
    billingText: {
        color: colors.SLATE[600],
        fontSize: 13,
        fontWeight: '800',
    },
    billingTextActive: {
        color: colors.TEXT_PRIMARY,
    },
    discountPill: {
        backgroundColor: colors.SUCCESS_TEXT,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    discountText: {
        color: colors.WHITE,
        fontSize: 10,
        fontWeight: '900',
    },
    planCards: {
        gap: 12,
    },
    planCard: {
        position: 'relative',
        borderWidth: 1,
        borderColor: colors.BORDER,
        borderRadius: 18,
        backgroundColor: colors.WHITE,
        padding: 16,
    },
    planCardSelected: {
        borderWidth: 2,
        borderColor: palette.honey,
        backgroundColor: '#fff3d2',
    },
    popularPill: {
        position: 'absolute',
        top: -11,
        right: 18,
        borderRadius: 999,
        backgroundColor: palette.honey,
        paddingHorizontal: 11,
        paddingVertical: 4,
        zIndex: 2,
    },
    popularText: {
        color: colors.WHITE,
        fontSize: 10,
        fontWeight: '900',
    },
    planHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    },
    planNameBlock: {
        flex: 1,
    },
    planName: {
        color: colors.TEXT_PRIMARY,
        fontSize: 18,
        fontWeight: '900',
    },
    planCardSubtitle: {
        color: palette.honeyDark,
        fontSize: 11,
        fontWeight: '800',
        marginTop: 2,
    },
    priceBlock: {
        alignItems: 'flex-end',
        maxWidth: 116,
    },
    priceText: {
        color: colors.TEXT_PRIMARY,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -0.8,
    },
    priceCaption: {
        color: colors.SLATE[600],
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'right',
    },
    planFeatures: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 12,
        rowGap: 9,
    },
    featureItem: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        paddingRight: 8,
    },
    featureText: {
        flex: 1,
        color: colors.TEXT_PRIMARY,
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
    },
    planFooter: {
        marginTop: 16,
        borderRadius: 20,
        backgroundColor: palette.cream,
        borderWidth: 1,
        borderColor: colors.BORDER,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    chosenLabel: {
        color: colors.SLATE[400],
        fontSize: 11,
        fontWeight: '900',
    },
    chosenPlan: {
        color: colors.TEXT_PRIMARY,
        fontSize: 16,
        fontWeight: '900',
        marginTop: 2,
    },
    chosenPrice: {
        color: colors.TEXT_PRIMARY,
        fontSize: 13,
        fontWeight: '800',
    },
    submitButton: {
        minWidth: 162,
        minHeight: 56,
        borderRadius: 28,
        backgroundColor: colors.TEXT_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 18,
        paddingRight: 8,
        gap: 12,
    },
    submitButtonDisabled: {
        opacity: 0.65,
    },
    submitButtonText: {
        color: colors.WHITE,
        fontSize: 15,
        fontWeight: '900',
    },
    submitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.honey,
    },
});

export default RegisterScreen;
