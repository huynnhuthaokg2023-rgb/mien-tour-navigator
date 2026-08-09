import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type ReviewTarget = "location" | "tour";

export type Review = {
  id: string;
  target_type: string;
  target_id: string;
  author_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
};

export async function fetchReviews(targetType: ReviewTarget, targetId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Review[];
}

export function Stars({
  value,
  size = "size-4",
  onChange,
}: {
  value: number;
  size?: string;
  onChange?: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        const icon = (
          <Star
            className={`${size} ${filled ? "fill-gold text-gold" : "text-muted-foreground"}`}
            aria-hidden
          />
        );
        if (!onChange) return <span key={n}>{icon}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} sao`}
            className="p-0.5"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export function ReviewSection({
  targetType,
  targetId,
}: {
  targetType: ReviewTarget;
  targetId: string;
}) {
  const qc = useQueryClient();
  const key = ["reviews", targetType, targetId];
  const reviews = useQuery({ queryKey: key, queryFn: () => fetchReviews(targetType, targetId) });

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        target_type: targetType,
        target_id: targetId,
        author_name: name.trim() || "Khách",
        rating,
        comment: comment.trim(),
        approved: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt.");
      setName("");
      setComment("");
      setRating(5);
      qc.invalidateQueries({ queryKey: key });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Gửi đánh giá thất bại"),
  });

  const list = reviews.data ?? [];
  const average = list.length
    ? list.reduce((sum, r) => sum + r.rating, 0) / list.length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
        <Stars value={average} size="size-5" />
        <p className="text-sm font-semibold">
          {list.length ? `${average.toFixed(1)}/5 · ${list.length} đánh giá` : "Chưa có đánh giá"}
        </p>
      </div>

      <ul className="space-y-3">
        {list.map((r) => (
          <li key={r.id} className="rounded-2xl bg-card p-4 shadow-elevated">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">{r.author_name}</p>
              <Stars value={r.rating} />
            </div>
            {r.comment && (
              <p className="mt-2 text-sm whitespace-pre-line text-foreground/85">{r.comment}</p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleDateString("vi-VN")}
            </p>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit.mutate();
        }}
        className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated"
      >
        <p className="text-sm font-extrabold text-primary">VIẾT ĐÁNH GIÁ CỦA BẠN</p>
        <div>
          <Label>Chấm điểm</Label>
          <div className="mt-1">
            <Stars value={rating} size="size-7" onChange={setRating} />
          </div>
        </div>
        <div>
          <Label htmlFor="review-name">Họ tên</Label>
          <Input
            id="review-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên của bạn"
            className="mt-1 h-12 rounded-2xl"
          />
        </div>
        <div>
          <Label htmlFor="review-comment">Bình luận</Label>
          <Textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn…"
            className="mt-1 rounded-2xl"
          />
        </div>
        <Button
          type="submit"
          disabled={submit.isPending}
          className="h-12 w-full rounded-2xl font-bold"
        >
          GỬI ĐÁNH GIÁ
        </Button>
        <p className="text-xs text-muted-foreground">
          Đánh giá sẽ được quản trị viên duyệt trước khi hiển thị công khai.
        </p>
      </form>
    </div>
  );
}
