import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Smartphone,
  Bell,
  Users,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Trash2,
  AlertCircle,
  FileText,
  Radio
} from 'lucide-react';
import { BroadcastMessage, Employee, User } from '../../types';
import { StorageService } from '../../services/storage';
import { getTodayShamsiDetailed, formatNumberFa } from '../../utils/dateUtils';

interface MessagesViewProps {
  currentUser: User;
  employees: Employee[];
  messages: BroadcastMessage[];
  onRefresh: () => void;
  canSend: boolean;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  employees,
  messages,
  onRefresh,
  canSend,
}) => {
  const shamsi = getTodayShamsiDetailed();
  const settings = StorageService.getSettings();

  const [recipientType, setRecipientType] = useState<'ALL' | 'WORKSHOP_1' | 'WORKSHOP_2' | 'SELECTED'>('ALL');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [channel, setChannel] = useState<'SMS' | 'IN_APP' | 'BOTH'>('BOTH');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Ready SMS Templates
  const templates = [
    {
      title: 'یادآوری ساعت کار و شیفت',
      content: 'همکاران گرامی، لطفاً به ساعت آغاز به کار کارگاه دقت نموده و حضور خود را در بدو ورود ثبت فرمایید.',
    },
    {
      title: 'واریز حقوق و فیش ماهانه',
      content: 'حقوق این ماه به شماره حساب شما واریز گردید. فیش حقوقی در میز کار کاربری شما قابل مشاهده است.',
    },
    {
      title: 'هشدار ثبت ورود در شعاع ۲۰ متر',
      content: 'یادآوری مهم: ثبت تردد هوشمند صرفاً در محدوده حداکثر ۲۰ متری کارگاه مجاز است. لطفاً داخل سالن حضور خود را ثبت نمایید.',
    },
    {
      title: 'جلسه هماهنگی کارگاه',
      content: 'فردا راس ساعت ۰۸:۳۰ جلسه هماهنگی سرپرستان و پرسنل کارگاه برگزار می‌شود. حضور به موقع الزامی است.',
    },
    {
      title: 'اعلام ساعت اضافه کاری',
      content: 'پرسنل محترمی که تمایل به ثبت اضافه کاری برای پایان هفته دارند، لطفاً تا پایان ساعت اداری به مدیریت اطلاع دهند.',
    },
  ];

  const handleApplyTemplate = (tpl: { title: string; content: string }) => {
    setTitle(tpl.title);
    setContent(tpl.content);
  };

  const handleToggleEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // Calculate target recipients
  const getRecipientNames = (): string[] => {
    if (recipientType === 'ALL') {
      return ['همه پرسنل (تمام کارگاه‌ها)'];
    }
    if (recipientType === 'WORKSHOP_1') {
      return ['نیروهای کارگاه ۱ (تولید و مونتاژ)'];
    }
    if (recipientType === 'WORKSHOP_2') {
      return ['نیروهای کارگاه ۲ (انبار و بسته‌بندی)'];
    }
    return employees
      .filter((e) => selectedEmployeeIds.includes(e.id))
      .map((e) => `${e.firstName} ${e.lastName}`);
  };

  const getRecipientCount = (): number => {
    if (recipientType === 'ALL') return employees.length;
    if (recipientType === 'WORKSHOP_1') {
      return employees.filter((e) => !e.workshopId || e.workshopId === 'ws_1').length;
    }
    if (recipientType === 'WORKSHOP_2') {
      return employees.filter((e) => e.workshopId === 'ws_2').length;
    }
    return selectedEmployeeIds.length;
  };

  // Handle Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFeedback({ type: 'error', message: 'لطفاً عنوان و متن پیام را وارد نمایید.' });
      return;
    }

    if (recipientType === 'SELECTED' && selectedEmployeeIds.length === 0) {
      setFeedback({ type: 'error', message: 'لطفاً حداقل یک نفر از پرسنل را انتخاب نمایید.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    const recipientCount = getRecipientCount();
    const parts = Math.ceil(content.length / 70) || 1;

    setTimeout(() => {
      const newMessage: BroadcastMessage = {
        id: `msg_${Date.now()}`,
        companyId: settings.id,
        senderName: currentUser.name,
        recipientType,
        recipientIds: recipientType === 'SELECTED' ? selectedEmployeeIds : undefined,
        recipientNames: getRecipientNames(),
        title: title.trim(),
        content: content.trim(),
        channel,
        sentAt: `${shamsi.dateString} - ${new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
        status: 'DELIVERED',
        partsCount: parts,
      };

      StorageService.addMessage(newMessage);
      setIsSending(false);
      setTitle('');
      setContent('');
      setSelectedEmployeeIds([]);
      setFeedback({
        type: 'success',
        message: `پیام با موفقیت به ${formatNumberFa(recipientCount)} نفر از پرسنل ارسال گردید (${channel === 'SMS' ? 'پیامک مستقیم' : channel === 'IN_APP' ? 'اعلان درون‌برنامه‌ای' : 'پیامک + اعلان'}).`,
      });
      onRefresh();
    }, 600);
  };

  const handleDeleteMessage = (id: string) => {
    if (confirm('آیا از حذف این پیام از تاریخچه اطمینان دارید؟')) {
      StorageService.deleteMessage(id);
      onRefresh();
    }
  };

  const smsChars = content.length;
  const smsParts = Math.ceil(smsChars / 70) || (smsChars > 0 ? 1 : 0);

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Page Header */}
      <div className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-800">
                پیام‌رسانی و پنل پیامک کارگاه
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                ارسال اطلاعیه درون‌برنامه‌ای و پیامک به پرسنل کارگاه‌ها (فردی، کارگاهی یا همگانی)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>پنل پیامک فعال (سرشماره {settings.smsSenderNumber || '500040001084'})</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Compose on Right/Top, History on Left/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full">
        {/* Compose Form */}
        <div className="lg:col-span-7 bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm lg:text-base text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>ارسال پیام یا پیامک جدید</span>
            </h3>
            <span className="text-xs text-slate-400">
              فرستنده: <strong className="text-slate-700">{currentUser.name}</strong>
            </span>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            {/* 1. Recipient Scope */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                گیرندگان پیام:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientType('ALL')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    recipientType === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  همه کارکنان ({formatNumberFa(employees.length)})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('WORKSHOP_1')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    recipientType === 'WORKSHOP_1'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  کارگاه ۱ (اصلی)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('WORKSHOP_2')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    recipientType === 'WORKSHOP_2'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  کارگاه ۲ (انبار)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('SELECTED')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                    recipientType === 'SELECTED'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  انتخاب نفرات ({formatNumberFa(selectedEmployeeIds.length)})
                </button>
              </div>

              {/* Multi-select employees list if SELECTED */}
              {recipientType === 'SELECTED' && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-40 overflow-y-auto space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">
                    پرسنل مورد نظر را علامت بزنید:
                  </div>
                  {employees.map((emp) => {
                    const isChecked = selectedEmployeeIds.includes(emp.id);
                    return (
                      <label
                        key={emp.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleEmployee(emp.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400">({emp.position})</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {emp.workshopId === 'ws_2' ? 'کارگاه ۲' : 'کارگاه ۱'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Channel Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                کانال ارسال:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('BOTH')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    channel === 'BOTH'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>پیامک + اعلان برنامه</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    channel === 'SMS'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>فقط پیامک به موبایل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('IN_APP')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    channel === 'IN_APP'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>فقط اعلان درون‌برنامه</span>
                </button>
              </div>
            </div>

            {/* Quick Templates Bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>قالب‌های آماده پیامک:</span>
                </label>
                <span className="text-[10px] text-slate-400">کلیک برای درج سریع</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-[11px] text-slate-600 transition-colors border border-slate-200/80 cursor-pointer shrink-0"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                موضوع / عنوان پیام:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: جلسه هماهنگی کارگاه ۱ و ۲"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">
                  متن پیام:
                </label>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>{formatNumberFa(smsChars)} کاراکتر</span>
                  <span>•</span>
                  <span>{formatNumberFa(smsParts)} پارت پیامک</span>
                </div>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="متن کامل پیامک یا اطلاعیه خود را بنویسید..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSending || !canSend}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending
                    ? 'در حال ارسال پیامک‌ها...'
                    : `ارسال نهایی به ${formatNumberFa(getRecipientCount())} پرسنل`}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* History / Sent Messages */}
        <div className="lg:col-span-5 bg-white p-5 lg:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm lg:text-base text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>تاریخچه پیام‌های ارسالی</span>
            </h3>
            <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {formatNumberFa(messages.length)} پیام
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                هنوز پیامی ارسال نشده است.
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:shadow-xs transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{msg.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>فرستنده: {msg.senderName}</span>
                        <span>•</span>
                        <span>{msg.sentAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> تحویل شده
                      </span>
                      {canSend && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="حذف از تاریخچه"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>
                        گیرندگان:{' '}
                        {msg.recipientType === 'ALL'
                          ? 'همه پرسنل'
                          : msg.recipientType === 'WORKSHOP_1'
                          ? 'کارگاه ۱ (اصلی)'
                          : msg.recipientType === 'WORKSHOP_2'
                          ? 'کارگاه ۲ (انبار)'
                          : msg.recipientNames?.join('، ') || 'انتخابی'}
                      </span>
                    </div>

                    <span className="font-medium text-indigo-600">
                      {msg.channel === 'BOTH' ? 'پیامک + اعلان' : msg.channel === 'SMS' ? 'پیامک' : 'اعلان برنامه'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
