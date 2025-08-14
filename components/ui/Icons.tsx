import React from 'react';
import { 
  Brain, 
  BookOpen, 
  MessageCircle, 
  Loader2, 
  Mic, 
  Camera, 
  Send, 
  Hash, 
  RefreshCw, 
  Download,
  Sparkles,
  FileText,
  Calculator,
  Lightbulb,
  Target,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Star,
  Copy,
  X,
  Search,
  Upload,
  HelpCircle,
  Bell,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Check,
  Play,
  Pause,
  Clock,
  Trophy,
  BarChart3,
  ArrowRight,
  Menu,
  X as XClose
} from 'lucide-react';

type IconProps = React.SVGProps<SVGSVGElement>;

// Iconos principales de la aplicación
export const BrainCircuitIcon: React.FC<IconProps> = (props) => <Brain {...props} />;
export const BookOpenIcon: React.FC<IconProps> = (props) => <BookOpen {...props} />;
export const MessageCircleIcon: React.FC<IconProps> = (props) => <MessageCircle {...props} />;
export const LoaderCircleIcon: React.FC<IconProps> = (props) => <Loader2 {...props} className="animate-spin" />;
export const MicIcon: React.FC<IconProps> = (props) => <Mic {...props} />;
export const CameraIcon: React.FC<IconProps> = (props) => <Camera {...props} />;
export const SendIcon: React.FC<IconProps> = (props) => <Send {...props} />;
export const HashIcon: React.FC<IconProps> = (props) => <Hash {...props} />;
export const RefreshCwIcon: React.FC<IconProps> = (props) => <RefreshCw {...props} />;
export const DownloadIcon: React.FC<IconProps> = (props) => <Download {...props} />;

// Iconos adicionales para funcionalidades
export const SparklesIcon: React.FC<IconProps> = (props) => <Sparkles {...props} />;
export const FileTextIcon: React.FC<IconProps> = (props) => <FileText {...props} />;
export const CalculatorIcon: React.FC<IconProps> = (props) => <Calculator {...props} />;
export const LightbulbIcon: React.FC<IconProps> = (props) => <Lightbulb {...props} />;
export const TargetIcon: React.FC<IconProps> = (props) => <Target {...props} />;
export const CheckCircleIcon: React.FC<IconProps> = (props) => <CheckCircle {...props} />;
export const AlertCircleIcon: React.FC<IconProps> = (props) => <AlertCircle {...props} />;
export const SettingsIcon: React.FC<IconProps> = (props) => <Settings {...props} />;
export const ZapIcon: React.FC<IconProps> = (props) => <Zap {...props} />;
export const StarIcon: React.FC<IconProps> = (props) => <Star {...props} />;
export const CopyIcon: React.FC<IconProps> = (props) => <Copy {...props} />;
export const XIcon: React.FC<IconProps> = (props) => <X {...props} />;

// Iconos para la interfaz de Elicit
export const SearchIcon: React.FC<IconProps> = (props) => <Search {...props} />;
export const UploadIcon: React.FC<IconProps> = (props) => <Upload {...props} />;
export const HelpCircleIcon: React.FC<IconProps> = (props) => <HelpCircle {...props} />;
export const BellIcon: React.FC<IconProps> = (props) => <Bell {...props} />;
export const ChevronDownIcon: React.FC<IconProps> = (props) => <ChevronDown {...props} />;
export const ChevronRightIcon: React.FC<IconProps> = (props) => <ChevronRight {...props} />;
export const MoreHorizontalIcon: React.FC<IconProps> = (props) => <MoreHorizontal {...props} />;
export const CheckIcon: React.FC<IconProps> = (props) => <Check {...props} />;
export const PlayIcon: React.FC<IconProps> = (props) => <Play {...props} />;
export const PauseIcon: React.FC<IconProps> = (props) => <Pause {...props} />;
export const ClockIcon: React.FC<IconProps> = (props) => <Clock {...props} />;
export const TrophyIcon: React.FC<IconProps> = (props) => <Trophy {...props} />;
export const BarChart3Icon: React.FC<IconProps> = (props) => <BarChart3 {...props} />;
export const ArrowRightIcon: React.FC<IconProps> = (props) => <ArrowRight {...props} />;
export const MenuIcon: React.FC<IconProps> = (props) => <Menu {...props} />;
export const XCloseIcon: React.FC<IconProps> = (props) => <XClose {...props} />;