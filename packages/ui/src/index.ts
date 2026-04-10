// ─── Utilities ────────────────────────────────────────────────────────────────
export {
  cn,
  formatCurrency,
  formatCompact,
  formatPercent,
  formatDate,
  getInitials,
} from "./lib/utils";

// ─── Components ───────────────────────────────────────────────────────────────
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/card";
export { Badge, badgeVariants } from "./components/badge";
export type { BadgeProps } from "./components/badge";
export { Button, buttonVariants } from "./components/button";
export type { ButtonProps } from "./components/button";
export { Input } from "./components/input";
export type { InputProps } from "./components/input";
export { Label } from "./components/label";
export type { LabelProps } from "./components/label";
export { Textarea } from "./components/textarea";
export type { TextareaProps } from "./components/textarea";
export { Select } from "./components/select";
export type { SelectProps } from "./components/select";
export { Separator } from "./components/separator";
export { Skeleton } from "./components/skeleton";
export { Avatar } from "./components/avatar";
export { Checkbox } from "./components/checkbox";
export type { CheckboxProps } from "./components/checkbox";

// ─── Feedback ─────────────────────────────────────────────────────────────────
export { EmptyState } from "./feedback/empty-state";
export {
  KPICardSkeleton,
  DashboardSkeleton,
  TableSkeleton,
  InlineSkeleton,
} from "./feedback/loading-skeleton";
export { ErrorBoundary } from "./feedback/error-boundary";
