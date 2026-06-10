import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-EG');
}

export function formatCurrency(amount: number, currency = 'ILS'): string {
    return new Intl.NumberFormat('ar-PS', { style: 'currency', currency }).format(amount);
}

export const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    full_time: 'bg-blue-100 text-blue-800',
    part_time: 'bg-purple-100 text-purple-800',
    contract: 'bg-orange-100 text-orange-800',
    intern: 'bg-pink-100 text-pink-800',
};

export const statusLabels: Record<string, string> = {
    active: 'نشط',
    inactive: 'غير نشط',
    terminated: 'منتهي الخدمة',
    on_leave: 'في إجازة',
    full_time: 'دوام كامل',
    part_time: 'دوام جزئي',
    contract: 'عقد',
    intern: 'متدرب',
    male: 'ذكر',
    female: 'أنثى',
    permanent: 'دائم',
    fixed_term: 'محدد المدة',
    internship: 'تدريب',
    freelance: 'عمل حر',
    draft: 'مسودة',
    expired: 'منتهي',
};
